import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEMO_CONFIG } from './demo.config';
import { GraphDataService } from './graph-data.service';
import 'force-horse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('fh') forceHorse: ElementRef;

  config = DEMO_CONFIG;

  viewer: any;

  numOfNodes = 11;

  isScaleFree = true;
  randomizeColors = false;
  predefinedFile = DEMO_CONFIG.PREDEFINED_FILES[0];

  private selectedItems = { node: new Set(), edge: new Set() };

  constructor(private http: HttpClient,
              private gameData: GraphDataService) {
    this.createGraphFromPredefinedFile();
  }

  ngAfterViewInit() {
    this.forceHorse.nativeElement.readyEvent.subscribe((viewer) => {
      this.viewer = viewer;
      this.setAmount();
    });

    this.forceHorse.nativeElement.setConfig({
      showLabels: true,
      showNodeWeight: true,
      showEdgeWeight: true,
      showFilterButton: true,
      showLabelsButton: true,
      showNodeWeightButton: true,
      showEdgeWeightButton: true,
      useEdgesWeights: true,
      forceParameters: {
        '#charge': -350,
        '#linkStrength': 1,
        '#gravity': 0.2,
        '#linkDistance': 10,
        '#friction': 0.5
      }
    });

    this.createGraphFromPredefinedFile();
  }

  setData(data) {
    this.forceHorse.nativeElement.setData(data);
  }

  setAmount() {
    if (this.viewer && this.viewer.nodeDataArray) {
      this.numOfNodes = this.viewer.nodeDataArray.length;
    }
  }

  get visibleNodes() {
    return this.viewer.nodeDataArray.filter(n => !n.filtered);
  }

  get visibleEdges() {
    return this.viewer.edgeDataArray.filter(e => !e.filtered);
  }

  createRandomGraph() {
    const data = this.isScaleFree ?
      this.gameData.getRandomScaleFreeGraphData(this.numOfNodes, this.randomizeColors) :
      this.gameData.getRandomData(this.numOfNodes, this.randomizeColors);

    this.setData(data);
  }

  createGraphFromPredefinedFile() {
    this.http.get('assets/' + this.predefinedFile + '.json')
      .subscribe(res => {
        this.setData(res);
      });
  }

  createGraphFromFile($event) {
    if ($event.target.files && $event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.setData(JSON.parse((<any>e.currentTarget).result));
      reader.readAsText($event.target.files[0]);
    }
  }

  onHoverInside(item, on) {
    item.hovered = on;
    if (this.viewer) {
      this.viewer.onHoverOutside(item);
    }
  }

  onSelectInside(item, on, clearOldSelection = false) {
    const itemType = (item.class === DEMO_CONFIG.CLASS_NODE ? 'node' : 'edge');

    if (clearOldSelection) {
      this.viewer[itemType + 'DataArray']
        .filter((d) => this.selectedItems[itemType].has(d.id))
        .forEach((d) => d.selected = false);
      this.selectedItems[itemType].clear();
    }

    // Update the selectedItems set
    if (item.selected = on) {
      this.selectedItems[itemType].add(item.id);
    } else {
      this.selectedItems[itemType].delete(item.id);
    }

    if (this.viewer) {
      this.viewer.onSelectOutside();
    }
  }

  onClick(event, item) {
    // If the Ctrl key was pressed during the click ..
    // If the clicked element was marked as selected, deselect it, and vice versa
    if (event.ctrlKey) {
      this.onSelectInside(item, !item.selected);
    } else {
      // If the Ctrl key was not pressed ..
      // If the clicked node is selected, ignore the click
      // Else, clear the current selection, and select the clicked node
      if (!item.selected) {
        this.onSelectInside(item, true, true);
      }
    }
  }
}
