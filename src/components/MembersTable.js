import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

import { cloneDeep } from 'lodash';

import CheckBox from './Checkbox';

import "./MembersTable.css";

class MembersTable extends React.Component  {
    
    selectAll = false;

    constructor(props) {
        super(props);
        this.state = {
            columns: this.getColConfig(),
            data: this.props.data,
            selectedRecord: null,
            offset: cloneDeep(this.props.offset)
        }
    }

    static getDerivedStateFromProps(props, state) {
        return {
            data:  props.data,
            offset: props.offset
        };
    }

    getColConfig = () => {
        let columns = Object.keys(this.props.data[0]);
        let columnsList = [];
        columns.map((c) => {
            if (c === "isChecked" || c === "isEditable") {
                columnsList.push({
                    key: c,
                    displayName: c.toUpperCase(),
                    isVisible: false,
                    sort: false
                });
            } else {
                columnsList.push({
                    key: c,
                    displayName: c.toUpperCase(),
                    isVisible: true,
                    sort: true
                })
            }
        });
        return columnsList;
    }

    onSelectAll = (checked) => {
        this.selectAll = checked;
        this.state.data.map((d) => {
            d.isChecked = checked;
        })
        this.setState({
            data: this.state.data
        });
    }

    onChangeHandler = (checked, id) => {
        this.state.data.map((d) => {
            if (d.id === id) {
                d.isChecked = checked;
            }
        });
        this.setState({
            data: this.state.data
        });
    }

    getColumns = () => {
        let columns = [];
        columns.push(
            <th><CheckBox checked={this.selectAll} onChange={this.onSelectAll}/></th>
        );
        this.state.columns.map((col) => {
            col.isVisible && columns.push(<th>{col.displayName}</th>);
        });
        columns.push(
            <th>Actions</th>
        );
        return <tr>{columns}</tr>;
    }

    showHideRowInUpdatemode = (row, isEdit) => {
        this.state.data.map((d) => {
            if (d.id === row.id) {
                d.isEditable = isEdit;
            } else {
                d.isEditable = false;
            }
        });
        this.setState({
            data: this.state.data,
            selectedRecord: isEdit ? row : null
        });
    }

    onUpdateInputChange = (e, type) => {
        let record = cloneDeep(this.state.selectedRecord);
        record[type] = e;
        this.setState({
            selectedRecord: record
        });
    }

    updateSelectedRecord = (id) => {
        let records = this.state.data;
        records = records.map((d) => {
            if (d.id === id) {
                d = this.state.selectedRecord;
                d.isEditable = false;
            }
            return d;
        });
        this.setState({ data: [] }, () => {
            this.props.dataUpdate(this.state.selectedRecord);
        });
    }

    getTabledata = () => {
        let rows = [];
        this.state.data.map((d) => {
            let row = [];
            row.push(<td data-type="checkbox"><CheckBox id={d.id} checked={d.isChecked} onChange={this.onChangeHandler}/></td>);
            this.state.columns.map((col) => {
                if (col.isVisible) {
                    (d.isEditable && col.key !== "id") && row.push(<td><input class="form-control" type="text" value={this.state.selectedRecord[col.key]} onChange={(e) => this.onUpdateInputChange(e.target.value, col.key)}/></td>);
                    (!d.isEditable || col.key === "id") && row.push(<td>{d[col.key]}</td>);
                }
            });
            !d.isEditable && row.push(
                <td datatype>
                    <div className="actionContainer">
                        <div className="editIcon">
                            <FontAwesomeIcon onClick={() => this.showHideRowInUpdatemode(d, true)} icon={faEdit} />
                        </div>
                        <div className="deleteIcon">
                            <FontAwesomeIcon onClick={() => this.deleteRecord(d)} icon={faTrash} />
                        </div>
                    </div>
                </td>
            );
            d.isEditable && row.push(
                <td>
                  <button class="btn btn-primary" onClick={() => this.updateSelectedRecord(d.id)}>Update</button>
                  <button class="btn" onClick={() => this.showHideRowInUpdatemode(d, false)}>Close</button>
                </td>
            )
            rows.push(<tr key={d.id}>{row}</tr>);
        });
        return rows;
    }

    getSelectedTotalCount = () => {
        let count = 0;
        this.state.data.map((d) => {
            if (d.isChecked)
                count++;
        });
        return count;
    }

    deleteRecord = (rec) => {
        if(window.confirm("Are you sure to delete this record?")) {
            let ids = [];
            ids.push(rec.id);
            this.props.deleteRecords(ids);
        }
    }

    deleteSelectedRecord = () => {
        if(window.confirm("Are you sure to delete this record?")) {
            let ids = [];
            this.state.data.map((d) => {
                if (d.isChecked)
                    ids.push(d.id);
            });
            this.props.deleteRecords(ids);
        }
    }

    onSearchInputChange = (value) => {
        let table = document.getElementById("dataTable");
        let tr = table.getElementsByTagName("tr");
        for (let i = 0; i < tr.length; i++) {
            let nameTd = tr[i].getElementsByTagName("td")[2];
            let emailTd = tr[i].getElementsByTagName("td")[3];
            let roleTd = tr[i].getElementsByTagName("td")[4];
            if (nameTd || emailTd || roleTd) {
                let nameValue = nameTd.textContent || nameTd.innerText;
                let emailValue = emailTd.textContent || emailTd.innerText;
                let roleValue = roleTd.textContent || roleTd.innerText;
                if (nameValue.toUpperCase().indexOf(value.toUpperCase()) > -1 ||
                emailValue.toUpperCase().indexOf(value.toUpperCase()) > -1 ||
                roleValue.toUpperCase().indexOf(value.toUpperCase()) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    render() {
        return (<div className="text-center container ">
            <div className="tableContainer">
                <div className="col-xs-12">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">Search</span>
                        </div>
                        <input type="text" class="form-control" onChange={(e) => this.onSearchInputChange(e.target.value)} placeholder="Search by Name, Email and Role" aria-label="Username" aria-describedby="basic-addon1"/>
                    </div>
                </div>
            </div>
            <table className="table table-bordered" id="dataTable">
               <thead>{this.state.columns && this.getColumns()}</thead>
              <tbody>{this.state.data && this.getTabledata()}</tbody>
            </table>
            <div className="text-left">
                <button disabled={(this.getSelectedTotalCount() <=0)} className="btn btn-danger" onClick={this.deleteSelectedRecord}>Delete Selected ({this.getSelectedTotalCount()})</button>
            </div>
        </div>);
    }
}

export default MembersTable;