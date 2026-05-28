function findTree<T extends { children?: T[] }>(tree: T[], callback: (node: T) => boolean): T | undefined {
  for (const node of tree) {
    if (callback(node)) {
      return node;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const childResult = findTree(node.children, callback);
      if (childResult) {
        return childResult;
      }
    }
  }
}

export default {
  findTree,
};
