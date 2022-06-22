import React from 'react';

import './Checkbox.css';

class CheckBox extends React.Component {
    render() {
        return(
            <input 
            type="checkbox"
            checked={this.props.checked}
            onChange={(e) => this.props.onChange(e.target.checked, this.props.id || null)}
            />
        )
    };
}

export default CheckBox;