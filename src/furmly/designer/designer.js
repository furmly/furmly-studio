import React from "react";
import PropTypes from "prop-types";
import { FormContainer } from "furmly-base-web";
import * as SRD from "storm-react-diagrams";
import "./style.scss";
import Draggable from "./draggable";
import Panel from "./panel";
import prefs from "../../preferences";
import { DESIGNER_CONFIG } from "../../constants";

require("storm-react-diagrams/src/sass/main.scss");

const convertToKeyValuePair = function(obj) {
  return Object.keys(obj).map(x => {
    return { key: x, value: obj[x] };
  });
};
const createDesigner = Container => {
  class Designer extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        currentNode: null
      };
      this.diagramModel = new SRD.DiagramModel();
      this.engine = new SRD.DiagramEngine();
      this.config = prefs.getObj(DESIGNER_CONFIG) || this.getDefaultSettings();
      this.engine.installDefaultFactories();
      const main = this.getNodeForItem(this.props.args.main);
      main.setPosition(100, 100);
      main.addListener({
        selectionChanged: this.selectedNode,
        entityRemoved: this.sticky
      });
      this.diagramModel.addNode(main);
      this.engine.setDiagramModel(this.diagramModel);
    }

    UNSAFE_componentWillMount() {
      //rehydrate everything.
      this.createRelationships();
    }

    getDefaultSettings = () => {
      return prefs
        .set(DESIGNER_CONFIG, {
          itemColorMap: {
            "existing-step": "green",
            "existing-processor": "red",
            step: "gray",
            processor: "red",
            asyncValidator: "red",
            form: "#adad00",
            validator: "slate",
            element: "blue"
          }
        })
        .getObj(DESIGNER_CONFIG);
    };

    createRelationships = () => {
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
      this.setState({ relationships });
    };
    canAdd = (item, node) => {
      let rels = this.getRelationships(this.state.currentNode.name);
      if (rels) {
        const itemSource =
          this.props.args.main.name == this.state.currentNode.name
            ? this.props.args.main
            : this.props.args.elements[this.state.currentNode.name];
        const {
          relationships: { has = null, hasMany = null }
        } = itemSource;
        return (
          (has && has[item.key] && !node.getPort(item.key)) ||
          (hasMany && hasMany[item.key])
        );
      }
    };
    selectedNode = event => {
      if (event.isSelected) {
        this.setState({ currentNode: event.entity });
        return;
      }
      if (!this.diagramModel.getSelectedItems().length) {
        this.setState({ currentNode: null });
      }
    };
    sticky = event => {
      //put it back;
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
    remove = event => {
      console.log(event);
    };
    //horrible hack to get react storm diagram thing to refresh properly;
    //hope the author fixes sometime ever.
    refreshGraph = () => {
      const model = new SRD.DiagramModel();
      model.deSerializeDiagram(
        this.diagramModel.serializeDiagram(),
        this.engine
      );
      const nodes = model.getNodes();
      Object.keys(nodes).forEach(x => {
        nodes[x].addListener({
          selectionChanged: this.selectedNode,
          entityRemoved: this.removed
        });
      });
      this.diagramModel = model;
      this.engine.setDiagramModel(this.diagramModel);
      this.setState({
        currentNode: this.diagramModel.getNodes()[this.state.currentNode.id]
      });
    };
    addNode = (item, { x, y } = { x: 100, y: 100 }) => {
      const currentNode = this.state.currentNode;
      if (!currentNode) throw new Error("There's no node selected to add to.");
      if (!this.canAdd(item, currentNode)) return;
      const node = this.getNodeForItem(item);
      node.setPosition(x, y);

      const inPort = node.addInPort(this.state.currentNode.name);

      const outPort =
        currentNode.getPort(this.getItemValue(item)) ||
        currentNode.addPort(
          new SRD.DefaultPortModel(
            false,
            this.getItemValue(item),
            this.getItemValue(item)
          )
        );
      inPort.maximumLinks = 1;
      outPort.maximumLinks = (outPort.maximumLinks || 0) + 1;
      const link = outPort.link(inPort);

      this.engine.getDiagramModel().addNode(node);
      this.engine.getDiagramModel().addLink(link);

      this.refreshGraph();
    };
    getElements = () => {
      const elements =
        this.state.currentNode &&
        this.getItem(this.state.currentNode.name).elements;
     // console.log(elements);
      return (
        (elements && elements.length && elements) ||
        (elements && elements.template)
      );
    };
    drop = event => {
      event.preventDefault();
      this.addNode(
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
    render() {
      const { currentNode, relationships } = this.state;
      return (
        <div className={"container"}>
          <Panel>
            {(relationships &&
              currentNode &&
              relationships[currentNode.name] &&
              relationships[currentNode.name].map(x =>
                this._renderRelationship(x)
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
              smartRouting
              maxNumberPointsPerLink={0}
              diagramEngine={this.engine}
            />
          </div>
          <Panel right type={"large"}>
            <Container
              name={"__"}
              valueChanged={form => {
                //console.log(form);
                this.state.currentNode.extras = form;
                this.forceUpdate();
              }}
              value={currentNode && currentNode.extras && currentNode.extras.__}
              elements={this.getElements()}
              validator={{}}
            />
          </Panel>
        </div>
      );
    }
  }
  Designer.propTypes = {
    args: PropTypes.object.isRequired
  };
  return { getComponent: () => Designer };
};

export default createDesigner;
