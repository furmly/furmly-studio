import React from "react";
import PropTypes from "prop-types";
import { IconButton, Icon } from "furmly-base-web";
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
          icon: "tachometer-alt",
          displayLabel: "Dashboard"
        }
      ],
      key: "home"
    });
    this.setState({ menu, current: menu[menu.length - 1][0] });
  }
  open = async x => {
    await this.props.frame.setSubtitle(x.displayLabel);
    this.setState({ current: x });
    this.props.openMenu(x);
  };

  render() {
    return (
      <div className={"sideMenuContainer"}>
        <div className="actual-menu">
          {(this.state.menu || []).map(x => {
            return (
              <div className={"collapsible"} key={x.key}>
                <span className={"text"}>{x.name}</span>
                <div className={"content"}>
                  {x.items.map(i => (
                    <IconButton
                      label={i.displayLabel}
                      iconSize={16}
                      icon={i.icon}
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
        <div className={"user-controls"}>
          <Icon icon="user-circle" size={42} />
          <span>{this.props.client.getUsername()}</span>
          <br />
          <span className="logout interactive" onClick={this.props.logout}>
            Logout
          </span>
        </div>
      </div>
    );
  }
}

SideMenu.propTypes = {
  client: PropTypes.object,
  frame: PropTypes.object,
  openMenu: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
};

export default SideMenu;
