export const getChildIndex = (node: Element) => {
	if (!node.parentNode) {
		return -1;
	}

	return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
};
