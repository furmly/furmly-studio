import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "furmly-base-web";
import { iconMap } from "../../util";
import "./style.scss";

class SideMenu extends React.PureComponent {
  state = {
    menu: [],
    current: null
  };
  async UNSAFE_componentWillMount() {
    let menu = await this.props.client.getMenu();
    const categories = {};
    menu = menu.reduce((sum, x) => {
      if (typeof categories[x.group] == "undefined") {
        sum.push({ name: x.group, items: [], key: x.group });
        categories[x.group] = sum.length - 1;
      }
      sum[categories[x.group]].items.push(x);
      return sum;
    }, []);
    menu.unshift({
      name: "Home",
      items: [
        {
          value: "",
          type: "CLIENT",
          _id: "home",
          displayLabel: "Dashboard"
        }
      ],
      key: "home"
    });
    this.setState({ menu });
  }
  open = async x => {
    await this.props.frame.setSubtitle(x.displayLabel);
    this.setState({ current: x });
    this.props.openMenu(x);
  };
  render() {
    return (
      <div className={"sideMenuContainer"}>
        {(this.state.menu || []).map((x, index) => {
          return (
            <div className={"collapsible"} key={x.key}>
              <span className={"text"}>{x.name}</span>
              <div className={"content"}>
                {x.items.map(i => (
                  <IconButton
                    label={i.displayLabel}
                    iconSize={16}
                    icon={iconMap[i.icon] || "folder"}
                    className={`nav-button ${
                      i == this.state.current ? "current" : ""
                    }`}
                    key={i._id}
                    onClick={() => this.open(i)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

SideMenu.propTypes = {
  client: PropTypes.object,
  frame: PropTypes.object,
  openMenu: PropTypes.func.isRequired
};

export default SideMenu;
