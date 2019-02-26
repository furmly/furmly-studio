import React from "react";
import PropTypes from "prop-types";
import { BusyIndicator, Icon } from "furmly-base-web";
import Toast from "components/toast";
import "./style.scss";

class Dashboard extends React.Component {
  state = { totals: [], busy: false };
  mapping = {
    process: {
      label: "Processes",
      icon: "laptop",
      copy: `Processes are the primary building blocks of furmly.
       Every thing an end user sees starts from a process. Processes must contain atleast one step.`
    },
    lib: {
      label: "Libraries",
      icon: "book",
      copy: `Libraries are reusable pieces of code. 
      Classes/Functions that you use often should be turned to libraries. They are callable in processors of all types.`
    },
    asyncValidator: {
      label: "Asynchronous Validators",
      icon: "memory",
      copy: `Async Validators are basically Processors that elements can call when they need their state checked server side.
      They return a boolean as result.`
    },
    processor: {
      label: "Processors",
      icon: "microchip",
      copy: `Processors are pieces of code that can be executed in a number of places. 
      Their primary use case is when a user finishes filling a form and submits.`
    },
    step: {
      label: "Steps",
      icon: "cubes",
      copy: `Steps like their name suggests are used to express the number of forms a user goes through to complete a Process.
      Most steps require a Processor to operate on the data the user just submitted.`
    },
    user: {
      label: "Users",
      icon: "users",
      copy: `The number of registered Users in the system.
      Users can have multiple Roles. Users can have multiple claims.`
    },
    menu: {
      label: "Menus",
      icon: "bars",
      copy: `Menu items that appear on the front-end web/mobile application. 
      Menu items can target specific clients and Domains`
    },
    claim: {
      label: "Claims",
      icon: "lock",
      copy: `Claims are the primary means of authorizing what features a user has access to.
      Users can be assigned claims directly or they can be assigned to `
    },
    role: {
      label: "Roles",
      icon: "users-cog",
      copy: `Roles are means of determining what features a user has access to. 
      Roles have mutiple claims`
    }
  };
  async componentDidMount() {
    try {
      this.setState({ busy: true });
      const { totals } = await this.props.client.getDashboardStats();
      setTimeout(() => this.setState({ totals, busy: false }), 300);
    } catch (e) {
      Toast.show(e.message);
      this.setState({ busy: false });
    }
  }
  render() {
    return (
      <div className="dashboardPage">
        <h1 className="header">Welcome {this.props.client.getUsername()}</h1>
        <p className="microcopy">
          here is a rundown of the furmly magic you've made so far. Hover on
          each card for a brief overview of what they mean to furmly.
        </p>
        {(this.state.busy && <BusyIndicator />) || (
          <div className={"card-container"}>
            {this.state.totals.map(x => (
              <div key={x.key} className="card">
                <div className="content">
                  <div className="card-title">
                    <h3>{this.mapping[x.key].label}</h3>
                    <Icon icon={this.mapping[x.key].icon} size={32} />
                  </div>
                  <h1 className="count">{x.total}</h1>
                  <p className={"description"}>{this.mapping[x.key].copy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

Dashboard.propTypes = {
  client: PropTypes.object
};
export default Dashboard;
