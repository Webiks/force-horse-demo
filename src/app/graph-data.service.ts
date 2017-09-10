import { Injectable } from '@angular/core';
import { DEMO_CONFIG } from './demo.config';

@Injectable()
export class GraphDataService {

  constructor() {
  }

  getRandomData(numOfNodes, randomizeColors) {
    const graphData = {nodes: [], links: []};

    // Generate a random graph

    for (let i = 0; i < numOfNodes; i++) {
      this.fillNodeAttributes(i, graphData.nodes, randomizeColors);
    }

    const numEdges = numOfNodes * 3 / 2;
    for (let i = 0; i < numEdges; i++) {
      this.AddEdgeWithAttributes(
        Math.floor(Math.random() * numOfNodes),
        Math.floor(Math.random() * numOfNodes),
        graphData.nodes,
        graphData.links,
        randomizeColors
      );
    }

    return graphData;
  }

  getRandomScaleFreeGraphData(requiredNumOfNodes, randomizeColors) {

    // Start with two connected nodes
    const nodes = [];
    let currentNumOfNodes = 0;
    this.fillNodeAttributes(currentNumOfNodes++, nodes, randomizeColors);
    this.fillNodeAttributes(currentNumOfNodes++, nodes, randomizeColors);
    const edges = [];
    this.AddEdgeWithAttributes(0, 1, nodes, edges, randomizeColors);
    // An array for preferential attachment distribution selection
    const selectionArray = [0, 1];
    let selectionArrayLength = 2;

    // Add nodes one by one, add edges with preferential attachment distribution
    while (currentNumOfNodes < requiredNumOfNodes) {
      // allocate a new node
      this.fillNodeAttributes(currentNumOfNodes++, nodes, randomizeColors);
      // get random index in selection array
      const randomIndex = Math.floor(Math.random() * selectionArrayLength);
      // connect the new node to the randomly selected one
      this.AddEdgeWithAttributes(currentNumOfNodes - 1, selectionArray[randomIndex],
        nodes, edges, randomizeColors);
      // add the indexes of the newly connected nodes to the selection array
      selectionArray.push(currentNumOfNodes - 1);
      selectionArray.push(selectionArray[randomIndex]);
      selectionArrayLength += 2;
    }
    return {nodes, links: edges};
  }


  fillNodeAttributes(nodeIndex, nodesArray, randomizeColors) {
    const node: any = nodesArray[nodeIndex] = {};
    node.class = DEMO_CONFIG.CLASS_NODE;
    node.label = new Array(DEMO_CONFIG.LABEL_LENGTH)
      .fill(null)
      .map(() => DEMO_CONFIG.ALPHABET.charAt(Math.floor(Math.random() * DEMO_CONFIG.ALPHABET.length)))
      .join('');
    node.id = nodeIndex;
    if (randomizeColors) {
      const shapes = ['cross', 'diamond', 'square', 'triangle', 'star', 'wye', 'circle'];
      node.shape = shapes[Math.floor(Math.random() * shapes.length)];
      node.color = '#' + Math.floor(Math.random() * DEMO_CONFIG.MAX_COLOR).toString(16);
    } else {
      node.shape = 'circle';
    }
  }

  AddEdgeWithAttributes(sourceNodeIdx, targetNodeIdx, nodesArray, edgesArray, randomizeColors) {
    const edge: any = {};
    edge.class = DEMO_CONFIG.CLASS_EDGE;
    edge.source = sourceNodeIdx;
    edge.sourceLabel = nodesArray[sourceNodeIdx].label;
    edge.target = targetNodeIdx;
    edge.targetLabel = nodesArray[targetNodeIdx].label;
    if (randomizeColors) {
      edge.color = '#' + Math.floor(Math.random() * DEMO_CONFIG.MAX_COLOR).toString(16);
    }
    edgesArray.push(edge);
  }
}
