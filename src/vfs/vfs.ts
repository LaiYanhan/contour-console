import { INITIAL_USER_HOME } from './initialVfs';

export type VfsNodeType = 'file' | 'dir';

export interface VfsFile {
  type: 'file';
  name: string;
  content: string;
  permissions?: string;
  updatedAt?: string;
  isExecutable?: boolean;
  isSecret?: boolean;
}

export interface VfsDirectory {
  type: 'dir';
  name: string;
  children: Record<string, VfsNode>;
  permissions?: string;
  updatedAt?: string;
}

export type VfsNode = VfsFile | VfsDirectory;

function cloneNode(node: VfsNode): VfsNode {
  if (node.type === 'file') {
    return { ...node };
  }
  const clonedChildren: Record<string, VfsNode> = {};
  for (const key of Object.keys(node.children)) {
    clonedChildren[key] = cloneNode(node.children[key]);
  }
  return {
    ...node,
    children: clonedChildren,
  };
}

export class VirtualFileSystem {
  private root: VfsDirectory;
  private currentPath: string;
  private username: string;

  constructor(username: string = 'dedsec00') {
    this.username = username;
    this.currentPath = `/home/${username}`;

    // Initialize root directory tree
    const userHomeChildren: Record<string, VfsNode> = {};
    for (const key of Object.keys(INITIAL_USER_HOME)) {
      userHomeChildren[key] = cloneNode(INITIAL_USER_HOME[key]);
    }

    this.root = {
      type: 'dir',
      name: '',
      permissions: 'drwxr-xr-x',
      updatedAt: '2026-10-12 00:00',
      children: {
        home: {
          type: 'dir',
          name: 'home',
          permissions: 'drwxr-xr-x',
          updatedAt: '2026-10-12 00:00',
          children: {
            [username]: {
              type: 'dir',
              name: username,
              permissions: 'drwxr-xr-x',
              updatedAt: '2026-10-12 10:00',
              children: userHomeChildren,
            },
          },
        },
        system: {
          type: 'dir',
          name: 'system',
          permissions: 'dr-xr-xr-x',
          updatedAt: '2026-10-12 00:00',
          children: {
            'kernel.sys': {
              type: 'file',
              name: 'kernel.sys',
              content: '[TALOS-II KERNEL BINARY // CORE REV 4.19-RT]',
              permissions: '-r--r--r--',
              updatedAt: '2026-10-12 00:00',
            },
          },
        },
      },
    };
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getDisplayPath(): string {
    const userHome = `/home/${this.username}`;
    if (this.currentPath === userHome) return '~';
    if (this.currentPath.startsWith(`${userHome}/`)) {
      return `~${this.currentPath.slice(userHome.length)}`;
    }
    return this.currentPath;
  }

  public resolvePath(target: string): string {
    let raw = target.trim();
    if (!raw || raw === '.') return this.currentPath;

    // Handle home alias ~
    if (raw === '~' || raw.startsWith('~/')) {
      const userHome = `/home/${this.username}`;
      raw = raw === '~' ? userHome : `${userHome}${raw.slice(1)}`;
    }

    const isAbsolute = raw.startsWith('/');
    const parts = isAbsolute ? raw.split('/') : `${this.currentPath}/${raw}`.split('/');
    const stack: string[] = [];

    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(p);
      }
    }

    return `/${stack.join('/')}`;
  }

  public getNode(absolutePath: string): VfsNode | null {
    if (absolutePath === '/' || absolutePath === '') return this.root;
    const parts = absolutePath.split('/').filter((p) => p.length > 0);
    let current: VfsNode = this.root;

    for (const p of parts) {
      if (current.type !== 'dir') return null;
      if (!current.children[p]) return null;
      current = current.children[p];
    }

    return current;
  }

  public changeDirectory(target: string): { success: boolean; newPath?: string; error?: string } {
    const targetAbs = this.resolvePath(target);
    const node = this.getNode(targetAbs);

    if (!node) {
      return { success: false, error: `cd: no such file or directory: ${target}` };
    }
    if (node.type !== 'dir') {
      return { success: false, error: `cd: not a directory: ${target}` };
    }

    this.currentPath = targetAbs;
    return { success: true, newPath: this.currentPath };
  }

  public listDirectory(target: string = ''): { success: boolean; nodes?: VfsNode[]; error?: string } {
    const targetAbs = this.resolvePath(target || this.currentPath);
    const node = this.getNode(targetAbs);

    if (!node) {
      return { success: false, error: `ls: cannot access '${target}': No such file or directory` };
    }
    if (node.type === 'file') {
      return { success: true, nodes: [node] };
    }

    const items = Object.values(node.children);
    return { success: true, nodes: items };
  }

  public readFile(target: string): { success: boolean; content?: string; error?: string } {
    const targetAbs = this.resolvePath(target);
    const node = this.getNode(targetAbs);

    if (!node) {
      return { success: false, error: `cat: ${target}: No such file or directory` };
    }
    if (node.type === 'dir') {
      return { success: false, error: `cat: ${target}: Is a directory` };
    }

    return { success: true, content: node.content };
  }

  public makeDirectory(target: string): { success: boolean; error?: string } {
    const targetAbs = this.resolvePath(target);
    const parts = targetAbs.split('/').filter((p) => p.length > 0);
    if (parts.length === 0) {
      return { success: false, error: 'mkdir: cannot create root directory' };
    }

    const dirName = parts.pop()!;
    const parentPath = `/${parts.join('/')}`;
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `mkdir: cannot create directory '${target}': No such parent` };
    }
    if (parentNode.children[dirName]) {
      return { success: false, error: `mkdir: cannot create directory '${target}': File exists` };
    }

    parentNode.children[dirName] = {
      type: 'dir',
      name: dirName,
      permissions: 'drwxr-xr-x',
      updatedAt: '2026-10-12 12:00',
      children: {},
    };

    return { success: true };
  }

  public touchFile(target: string): { success: boolean; error?: string } {
    const targetAbs = this.resolvePath(target);
    const parts = targetAbs.split('/').filter((p) => p.length > 0);
    if (parts.length === 0) return { success: false, error: 'touch: invalid path' };

    const fileName = parts.pop()!;
    const parentPath = `/${parts.join('/')}`;
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `touch: cannot touch '${target}': No such parent directory` };
    }

    if (!parentNode.children[fileName]) {
      parentNode.children[fileName] = {
        type: 'file',
        name: fileName,
        content: '',
        permissions: '-rw-r--r--',
        updatedAt: '2026-10-12 12:00',
      };
    }

    return { success: true };
  }

  public removeNode(target: string): { success: boolean; error?: string } {
    const targetAbs = this.resolvePath(target);
    if (targetAbs === '/' || targetAbs === `/home/${this.username}`) {
      return { success: false, error: 'rm: cannot remove protected root or home directory' };
    }

    const parts = targetAbs.split('/').filter((p) => p.length > 0);
    const nodeName = parts.pop()!;
    const parentPath = `/${parts.join('/')}`;
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children[nodeName]) {
      return { success: false, error: `rm: cannot remove '${target}': No such file or directory` };
    }

    delete parentNode.children[nodeName];
    return { success: true };
  }
}
