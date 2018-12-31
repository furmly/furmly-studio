import React from "react";
import PropTypes from "prop-types";

class SideMenu extends React.Component {
  state = {
    items: []
  };
  async UNSAFE_componentWillMount() {
    const menu = await this.props.client.getMenu();
    window.alert(menu);
  }
  render() {
    return <div className={"sideMenuContainer"} />;
  }
}

SideMenu.propTypes = {
  client: PropTypes.object
};

export default SideMenu;
