import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPersonDigging} from "@fortawesome/free-solid-svg-icons";
import {colors} from "../utils/Colors";


const WorkInProgress = () => {
  return (
    <div className="flex flex-col justify-center items-center" style={{height:"calc(100vh - 250px)"}}>
      <FontAwesomeIcon icon={faPersonDigging} style={{fontSize:"200px", color:colors.primary}}/>
      <div className="p-5">
        <h1 className="text-5xl font-bold" style={{color:colors.secondary}}>Work in progress</h1>
      </div>
    </div>
  );
};

export default WorkInProgress;
