import React from "react";
import PropTypes from "prop-types";
class Table extends React.PureComponent {
  state = {
    sortedBy: null
  };
  _defaultSort = (propName, rows) => {
    return this.state.sortedBy.asc
      ? rows.sort((a, b) => {
          const x =
            typeof a[propName] == "string"
              ? a[propName].toLowerCase()
              : a[propName];
          const y =
            typeof b[propName] == "string"
              ? b[propName].toLowerCase()
              : b[propName];
          if (x > y) return 1;
          if (x < y) return -1;
          return 0;
        })
      : rows.sort((a, b) => {
          const x =
            typeof a[propName] == "string"
              ? a[propName].toLowerCase()
              : a[propName];
          const y =
            typeof b[propName] == "string"
              ? b[propName].toLowerCase()
              : b[propName];
          if (x < y) return 1;
          if (x > y) return -1;
          return 0;
        });
  };
  resolveSortingFunc = key => {
    const e = this.props.headers.find(x => key);
    return e.sort || this._defaultSort.bind(this, key);
  };
  setSortedBy = obj => {
    const { sortedBy } = this.state;
    if (sortedBy && sortedBy.key === obj.key) {
      //get sorting function
      this.setState({
        sortedBy: {
          ...sortedBy,
          asc: !sortedBy.asc,
          sort: this.resolveSortingFunc(obj.key)
        }
      });
      return;
    }
    this.setState({
      sortedBy: {
        key: obj.key,
        asc: true,
        sort: this.resolveSortingFunc(obj.key)
      }
    });
  };
  _renderHead = (obj, sortedBy = this.state.sortedBy) => {
    const arrow =
      sortedBy && obj.key === sortedBy.key && sortedBy.asc ? "▴" : "▾";
    return (
      <th key={obj.key} onClick={() => this.setSortedBy(obj)}>
        <span className={"header"}>{obj.label}</span>
        &nbsp;
        {arrow}
      </th>
    );
  };

  render() {
    const { headers, rows, onItemClicked, _key = "id" } = this.props;
    const { sortedBy } = this.state;
    const data = sortedBy ? sortedBy.sort(rows) : rows;
    return (
      <table className={"furmly-table"}>
        <thead>
          <tr>{headers.map(x => this._renderHead(x))}</tr>
        </thead>
        <tbody>
          {(data.length &&
            data.map(x => {
              return (
                <tr key={x[_key]} onClick={() => onItemClicked(x)}>
                  {headers.map(({ key }) => {
                    return (
                      <td key={key} className={`${key}-td`}>
                        {(this.props.getTemplateFor &&
                          this.props.getTemplateFor(key, x)) ||
                          ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })) || (
            <tr>
              <td colSpan={headers.length}>{"Nothing found..."}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

Table.propTypes = {
  headers: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  sort: PropTypes.func,
  sortedBy: PropTypes.object,
  getTemplateFor: PropTypes.func,
  _key: PropTypes.any,
  onItemClicked: PropTypes.func.isRequired
};

export default Table;
