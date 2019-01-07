import React from "react";
import PropTypes from "prop-types";
import { FormContainer } from "furmly-base-web";
import * as SRD from "storm-react-diagrams";
import "./style.scss";
import Draggable from "./draggable";
import prefs from "../../preferences";
import { DESIGNER_CONFIG } from "../../constants";

require("storm-react-diagrams/src/sass/main.scss");

const convertToKeyValuePair = function(obj) {
  return Object.keys(obj).map(x => {
    return { key: x, value: obj[x] };
  });
};
const createDesigner = Container => {
  class Designer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        currentNode: {},
        diagramModel: new SRD.DiagramModel(),
        engine: new SRD.DiagramEngine()
      };
      this.state.engine.installDefaultFactories();
      this.state.engine.setDiagramModel(this.state.model);
      this.config = prefs.getObj(DESIGNER_CONFIG) || this.getDefaultSettings();
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
            form: "yellow",
            validator: "slate",
            element: "blue"
          }
        })
        .getObj(DESIGNER_CONFIG);
    };
    createRelationships = () => {
      const rels = { main: this.props.args.main, ...this.props.args.elements };
      const relationships = Object.keys(rels).reduce((sum, rel) => {
        const { has = null, hasMany = null } = rels[rel].relationships || null;
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
      if (this.props.args.elements[this.state.currentNode.name].relationships) {
        const itemSource =
          this.props.args.main.name == this.state.currentNode.name
            ? this.props.args.main
            : this.props.args.elements[this.state.currentNode.name];
        const { has = null, hasMany = null } = itemSource;
        return (
          (has && has[item.key] && node.getPort(item.key)) ||
          (hasMany && hasMany[item.key])
        );
      }
    };
    addNode = (item, { x, y } = { x: 100, y: 100 }) => {
      const currentNode = this.state.diagramModel.getNode(
        this.state.currentNode.name
      );
      if (!currentNode)
        throw new Error(`Node does not exist ${this.state.currentNode}`);
      if (!this.canAdd(item, currentNode)) return;
      const node = this.getNodeForItem(item);
      node.x = x;
      node.y = y;
      const inPort = node.addInPort(this.state.currentNode.name);
      const outPort =
        currentNode.getPort(item.key) ||
        currentNode.addPort(new SRD.PortModel(item.key, "Out"));

      const link = outPort.link(inPort);
      this.state.diagramModel.addAll(node, link);
    };
    drop = event => {
      event.preventDefault();
      this.addNode(
        JSON.parse(event.dataTransfer.getData("furmly-diagram-node")),
        this.state.engine.getRelativeMousePoint(event)
      );
    };
    dragOver = event => event.preventDefault();
    getNodeForItem = item => {
      return new SRD.DefaultNodeModel(
        item.key,
        this.config.itemColorMap[item.key] || "rgb(0,192,255)"
      );
    };
    _renderRelationship = item => {
      return <Draggable item={item} className={"item"} />;
    };
    render() {
      const { currentNode, engine, relationships } = this.state;
      return (
        <div className={"container"}>
          <div className={"relationships"}>
            {relationships[currentNode.name].map(x =>
              this._renderRelationship(x)
            )}
          </div>
          <div
            className={"graph-container"}
            onDragOver={this.dragOver}
            onDrop={this.drop}
          >
            <SRD.DiagramWidget className={"graph"} diagramEngine={engine} />
          </div>
          <div className={"properties"}>
            <Container />
          </div>
        </div>
      );
    }
  }
  Designer.propTypes = {};
  return { getComponent: () => Designer };
};

export default createDesigner;
