import React from 'react';

const HintInput = (props) => {

  return(
    <div class="input-group mb-1 mw-0">
      <div class="input-group-prepend">
        <span class="input-group-text" style={{ minWidth: "62px" }}>{props.hint}</span>
      </div>
      <input
        class="form-control"
        placeholder={props.placeholdertext}
        value={props.value}
        onChange={event => props.onChange(event, props.param)}
      ></input>
    </div>
  )
};

export default HintInput;