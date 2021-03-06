import React from "react";
import PropTypes from "prop-types";
import {
  WorkerProvider,
  IconButton,
  FormContainer,
  ConfirmationDialog,
  Icon
} from "furmly-base-web";
import "brace";
import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";
import "brace/ext/searchbox";
import AceEditor from "react-ace";
import * as SRD from "storm-react-diagrams";
import "./style.scss";
import Draggable from "./draggable";
import Panel from "./panel";
import prefs from "../../preferences";
import { DESIGNER_CONFIG } from "../../constants";
import { distributeElements } from "./dagre-util";

require("storm-react-diagrams/src/sass/main.scss");

const convertToKeyValuePair = function(obj) {
  return Object.keys(obj).map(x => {
    return { key: x, value: obj[x] };
  });
};
const _p = rel => (typeof rel == "object" ? rel.path : rel);
const getPath = function(rel, propName) {
  if (!rel) return;
  const keys = Object.keys(rel);
  let found;
  for (let i = 0; i < keys.length; i++) {
    let path = _p(rel[keys[i]]);
    if ((path == propName && !found) || (found && rel[keys[i]].default))
      found = { path, name: keys[i] };
  }
  return found;
};
const createDesigner = (Container, withTemplateCache) => {
  class Designer extends React.PureComponent {
    constructor(props) {
      super(props);
      this.diagramModel = new SRD.DiagramModel();
      this.diagramModel.setZoomLevel(80);
      this.engine = new SRD.DiagramEngine();
      this.config = prefs.getObj(DESIGNER_CONFIG) || this.getDefaultSettings();
      this.engine.installDefaultFactories();
      const mainNode = this.getNodeForItem(this.props.args.main);
      mainNode.setPosition(100, 100);
      mainNode.addListener({
        selectionChanged: this.selectedNode
      });
      this.diagramModel.addNode(mainNode);
      this.engine.setDiagramModel(this.diagramModel);
      this.state = {
        currentNode: null,
        viewSource: false,
        changed: false,
        mainNode
      };
    }
    /**
     * Create relationships.
     * Popuate the templateCache.
     */
    UNSAFE_componentWillMount() {
      this.createRelationships(() => {
        //populate global template cache with designer templates.
        this.populateTemplateCache();
        const nodes = this.engine.getDiagramModel().getNodes();
        const main = nodes[Object.keys(nodes)[0]];
        //rehydrate everything based on value.

        if (
          this.rehydrate(
            this.props.args.main.name,
            this.props.value,
            main,
            main
          )
        ) {
          this.refreshGraph(true);
        }
      });
    }
    /**
     * This creates all the nodes to match the value of the data as at mount.
     */
    rehydrate = (
      entityName,
      value,
      currentNode,
      existingNode,
      rel,
      entityIndex = 0
    ) => {
      if (value) {
        const item = this.getItem(entityName);
        const { has = null, hasMany = null } = item.relationships || {};

        const node =
          existingNode || this.addNode(rel, { x: 100, y: 100 }, currentNode);

        // get properties for the node
        // also setup its dependencies.
        const properties = Object.keys(value).reduce((sum, x) => {
          const { path = null, name = null } =
            getPath(has, x) || getPath(hasMany, x) || {};
          if (path) {
            // this is a dependency.
            if (Array.prototype.isPrototypeOf(value[x])) {
              value[x].forEach((v, index) => {
                this.rehydrate(
                  name,
                  v,
                  node,
                  null,
                  { key: name, value: path },
                  index
                );
              });
            } else {
              this.rehydrate(name, value[x], node, null, {
                key: name,
                value: path
              });
            }
            return sum;
          }
          sum[x] = value[x];
          return sum;
        }, {});
        node.extras = { ...properties, index: entityIndex };
        return true;
      }
      return false;
    };
    /**
     * Default Settings the designer uses for things which include color configuration etc.
     */
    getDefaultSettings = () => {
      return prefs
        .set(DESIGNER_CONFIG, {
          itemColorMap: {
            "existing-step": "gray",
            "existing-processor": "#ab0101",
            step: "gray",
            processor: "#ab0101",
            asyncValidator: "#ab0101",
            form: "#adad00",
            validator: "slate",
            element: "#023069"
          }
        })
        .getObj(DESIGNER_CONFIG);
    };

    createRelationships = fn => {
      const rels = {
        [this.props.args.main.name]: this.props.args.main,
        ...this.props.args.elements
      };
      const relationships = Object.keys(rels).reduce((sum, rel) => {
        const { has = null, hasMany = null } = rels[rel].relationships || {};
        if (has || hasMany) {
          sum[rel] = [];
          if (has) {
            sum[rel] = sum[rel].concat(convertToKeyValuePair(has));
          }
          if (hasMany) {
            sum[rel] = sum[rel].concat(convertToKeyValuePair(hasMany));
          }
        }
        return sum;
      }, {});
      this.setState({ relationships }, fn);
    };

    populateTemplateCache = () => {
      Object.keys(this.props.args.templateCache).forEach(x => {
        this.props.templateCache.add(x, this.props.args.templateCache[x]);
      });
    };
    canAdd = (item, node) => {
      let rels = this.getRelationships(node.name);
      if (rels) {
        const itemSource =
          this.props.args.main.name == node.name
            ? this.props.args.main
            : this.props.args.elements[node.name];
        const {
          relationships: { has = null, hasMany = null }
        } = itemSource;
        return (
          (has && has[item.key] && !node.getPort(item.key)) ||
          (hasMany && hasMany[item.key])
        );
      }
    };
    processValue = force => {
      if (force || this.state.changed) {
        const value = this.updateTree(this.state.mainNode);
        this.props.valueChanged({ [this.props.name]: value });
      }
    };
    sortBy = (a, b) => {
      const x = typeof a.index === "undefined" ? -1 : a.index;
      const y = typeof b.index === "undefined" ? -1 : b.index;
      return x - y;
    };
    updateTree = node => {
      if (!node) return undefined;
      const value = { ...node.extras };
      node.getOutPorts().reduce((sum, x) => {
        const { has, hasMany } = this.getRelationships(node.name);
        // each port represents a list of a certain kind.
        const links = x.getLinks(); // each relationship
        if (getPath(hasMany, x.getName())) {
          const list = Object.keys(links).map(v => {
            return this.updateTree(links[v].getTargetPort().getParent()); // add this to the list
          });
          sum[x.getName()] = list.sort(this.sortBy);
        }
        if (getPath(has, x.getName())) {
          sum[x.getName()] = this.updateTree(
            links[Object.keys(links)[0]].getTargetPort().getParent()
          );
        }

        return sum;
      }, value);
      return value;
    };
    selectedNode = event => {
      if (event.isSelected) {
        this.setState({ currentNode: event.entity });
        return;
      }

      if (!this.diagramModel.getSelectedItems().length) {
        this.setState({ currentNode: null, changed: false });
      }
    };

    getItemValue = item => {
      if (typeof item.value == "object") return item.value.path;

      return item.value;
    };
    getRelationships = name => {
      return this.getItem(name).relationships;
    };

    getItem = name => {
      return this.props.args.main.name == name
        ? this.props.args.main
        : this.props.args.elements[name];
    };

    //horrible hack to get react storm diagram thing to refresh properly;
    //hope the author fixes sometime ever.
    refreshGraph = autoLayout => {
      const model = new SRD.DiagramModel();

      let serializedDiagram = this.diagramModel.serializeDiagram();
      if (autoLayout) serializedDiagram = distributeElements(serializedDiagram);
      model.deSerializeDiagram(serializedDiagram, this.engine);
      let nodes = model.getNodes();
      Object.keys(nodes).forEach(x => {
        nodes[x].addListener({
          selectionChanged: this.selectedNode,
          entityRemoved: this.removed
        });
      });

      this.diagramModel = model;
      this.engine.setDiagramModel(this.diagramModel);
      nodes = this.diagramModel.getNodes();
      this.setState({
        currentNode: this.state.currentNode && nodes[this.state.currentNode.id],
        mainNode: nodes[this.state.mainNode.id]
      });
    };
    addNode = (
      item,
      { x = 100 * Math.random() * 15, y = 100 * Math.random() * 15 } = {},
      currentNode = this.state.currentNode,
      defaultValue = {}
    ) => {
      if (!currentNode) throw new Error("There's no node selected to add to.");
      if (!this.canAdd(item, currentNode)) return;
      const node = this.getNodeForItem(item);
      node.setPosition(x, y);
      node.extras = defaultValue;

      const inPort = node.addInPort(<b>&#x2022;</b>);

      const outPort =
        currentNode.getPort(this.getItemValue(item)) ||
        currentNode.addPort(
          new SRD.DefaultPortModel(
            false,
            this.getItemValue(item),
            <b>{this.getItemValue(item)}&nbsp;&nbsp;&#x2666;</b>
          )
        );
      inPort.maximumLinks = 1;
      outPort.maximumLinks = (outPort.maximumLinks || 0) + 1;
      const link = outPort.link(inPort);
      this.engine.getDiagramModel().addNode(node);
      this.engine.getDiagramModel().addLink(link);
      return node;
    };

    addNodeAndRefresh = (...args) => {
      this.addNode.apply(this, args);
      this.refreshGraph();
    };
    getElements = () => {
      const elements =
        this.state.currentNode &&
        this.getItem(this.state.currentNode.name).elements;
      if (Array.prototype.isPrototypeOf(elements)) return elements;

      if (
        elements &&
        elements.furmly_ref &&
        !this.props.templateCache.get(elements.furmly_ref)
      )
        this.props.templateCache.add(elements.furmly_ref, elements.template);
      return (
        (Array.prototype.isPrototypeOf(elements) && elements) ||
        (elements && elements.template) ||
        (elements &&
          elements.template_ref &&
          this.props.templateCache.get(elements.template_ref))
      );
    };
    drop = event => {
      event.preventDefault();
      this.addNodeAndRefresh(
        JSON.parse(event.dataTransfer.getData("furmly-diagram-node")),
        this.engine.getRelativeMousePoint(event)
      );
    };
    dragOver = event => event.preventDefault();
    getNodeForItem = item => {
      return new SRD.DefaultNodeModel(
        item.key || item.name, //this tweak supports the main object.
        this.config.itemColorMap[item.key] || "rgb(0,192,255)"
      );
    };
    _renderRelationship = item => {
      return <Draggable key={item.key} item={item} className={"item"} />;
    };
    askForConfirmation = () => {
      this.setState({ confirmationVisible: true });
    };
    closeConfirmation = () => {
      this.setState({ confirmationVisible: false });
    };
    destroyNode = (node = this.state.currentNode) => {
      this.removeNode(node);
      this.setState(
        { changed: true, currentNode: null, confirmationVisible: false },
        this.processValue.bind(this, true)
      );
    };
    toggleSource = () => {
      this.setState({ viewSource: !this.state.viewSource });
    };
    formValueChanged = (form, edit) => {
      const { currentNode } = this.state;
      currentNode.extras = form;
      currentNode.$edit = edit;
      this.setState({
        changed: true,
        currentNode
      });
      this.processValue(true);
    };
    formIntermediateValueChanged = value => {
      const { currentNode } = this.state;
      currentNode.$edit = value;
      this.setState({
        currentNode
      });
    };
    removeNode = (node = this.state.currentNode) => {
      node.extras = undefined;
      Object.keys(node.ports).forEach(x => {
        const port = node.ports[x];
        if (!port.in) {
          //go to the other side of the link.
          Object.keys(port.links).forEach(z => {
            //port
            const link = port.links[z];
            this.removeNode(link.targetPort.parent);
          });
        }
      });
      node.remove();
    };
    render() {
      const {
        currentNode,
        relationships,
        mainNode,
        confirmationVisible,
        viewSource
      } = this.state;
      return (
        <div className={"container"}>
          <ConfirmationDialog
            content={`Are you sure you want to delete ${currentNode &&
              currentNode.name}?`}
            visibility={confirmationVisible}
            onConfirm={this.destroyNode}
            onCancel={this.closeConfirmation}
          />
          <Panel>
            {(relationships &&
              currentNode &&
              relationships[currentNode.name] && (
                <React.Fragment>
                  {relationships[currentNode.name].map(x =>
                    this._renderRelationship(x)
                  )}
                  <FormContainer className="info">
                    <label>
                      <Icon icon="info-circle" /> Please drag and drop
                      components to add.
                    </label>
                  </FormContainer>
                </React.Fragment>
              )) ||
              null}
          </Panel>
          <div
            className={"graph-container"}
            onDragOver={this.dragOver}
            onDrop={this.drop}
          >
            <SRD.DiagramWidget
              className={"graph"}
              allowLooseLinks={false}
              deleteKeys={[]}
              maxNumberPointsPerLink={0}
              diagramEngine={this.engine}
            />
          </div>
          <Panel right type={"large"}>
            <WorkerProvider>
              {viewSource ? (
                <AceEditor
                  className={"editor"}
                  value={
                    (currentNode &&
                      (currentNode.$edit ||
                        JSON.stringify(currentNode.extras, null, " "))) ||
                    ""
                  }
                  onChange={e => {
                    let valid;
                    try {
                      valid = JSON.parse(e);
                      this.formValueChanged(valid, e);
                    } catch (e) {
                      this.formIntermediateValueChanged(e);
                    }
                  }}
                  mode={"json"}
                  theme={"monokai"}
                  editorProps={{ $blockScrolling: false }}
                  enableBasicAutocompletion={true}
                  enableLiveAutocompletion={true}
                />
              ) : (
                <div className="form">
                  <Container
                    valueChanged={this.formValueChanged}
                    value={currentNode && currentNode.extras}
                    elements={this.getElements()}
                    validator={{}}
                  />
                </div>
              )}
              {currentNode && (
                <React.Fragment>
                  <div className="divider" />
                  <FormContainer>
                    {(currentNode !== mainNode && (
                      <IconButton
                        icon="trash"
                        label="Delete"
                        onClick={() => this.askForConfirmation()}
                      />
                    )) ||
                      null}
                    <IconButton
                      icon="eye"
                      label={`${viewSource ? "Close" : "View"} source`}
                      onClick={() => this.toggleSource()}
                    />
                  </FormContainer>
                </React.Fragment>
              )}
            </WorkerProvider>
          </Panel>
        </div>
      );
    }
  }
  Designer.propTypes = {
    args: PropTypes.object.isRequired,
    value: PropTypes.object,
    name: PropTypes.string.isRequired,
    templateCache: PropTypes.object.isRequired,
    valueChanged: PropTypes.func.isRequired
  };
  return { getComponent: () => withTemplateCache(Designer) };
};

export default createDesigner;
