/*
    nodeType = the type for all nodes in the graph
    id: the ID of the node
    depth: the number of generations from the main node. Also helps determine the positioning of the node on the screen.
    location: the x,y position of the node.
    style: the style string for the node, e.g. size of the node, shape, font size, font weight
*/
export type nodeType = {
  id: string;
  depth: number;
  location: { x: number; y: number };
  style: string;
};

/* 
    edgeType: the type for all edges in the graph
    from: the starting point of the edge
    to: the end point of the edge
    relation: the relationship between from and to
    contested: whether the connection has been contested, and what type of contest it is (e.g. other parent)
    unusual: whether the connection is unusual, and why it is unusual (e.g. incest)
    style: the style string for the edge, e.g. undirected vs directed, dashed for co-parents not spouses, coloured for unusual & contested
*/
export type edgeType = {
  from: string;
  to: string;
  relation: string;
  contested?: string;
  unusual?: string;
  style: string;
};
