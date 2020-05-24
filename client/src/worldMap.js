import React, { useState, Component } from 'react';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import ReactMapGL from 'react-map-gl';


const Slider = () => {

  const [ value, setValue ] = useState(1900); 
  const min = 0;
  const max = 2020;

  return (
    <RangeSlider
      value={value}
      onChange={changeEvent => setValue(changeEvent.target.value)}
      min={min}
      max={max}
      size='lg'
    />
  );

};

export default function WorldMap() {
  const [viewport, setViewport] = useState({
    width: 1500,
    height: 750,
    latitude: 11.0,
    longitude: 9.0,
    zoom: 2,
    minZoom: 2,
  });

  return (
  	<div id="map-container">
	    <ReactMapGL
	      {...viewport}
	      onViewportChange={setViewport}
	      width="90w"
      	  height="80vh"
      	  mapStyle="mapbox://styles/mapbox/outdoors-v11"
	      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
	    /> 
	    <Slider />
	</div>
  );
}

