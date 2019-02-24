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
      icon: "laptop"
    },
    lib: {
      label: "Libraries",
      icon: "book"
    },
    asyncValidator: {
      label: "Asynchronous Validators",
      icon: "memory"
    },
    processor: {
      label: "Processors",
      icon: "microchip"
    },
    step: {
      label: "Steps",
      icon: "cubes"
    }
  };
  async componentDidMount() {
    try {
      const { totals } = await this.props.client.getDashboardStats();
      this.setState({ totals, busy: false });
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
          below is a rundown of the magic you've made so far.
        </p>
        {(this.state.busy && <BusyIndicator />) || (
          <div className={"card-container"}>
            {this.state.totals.map(x => (
              <div key={x.key} className="card">
                <div className="content">
                  <h3>
                    {this.mapping[x.key].label}
                    <Icon icon={this.mapping[x.key].icon} size={32} />
                  </h3>
                  <h1>{x.total}</h1>
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
