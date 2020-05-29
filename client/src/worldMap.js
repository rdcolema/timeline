import React, { Component } from 'react';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import axios from 'axios';


const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
  cursor: "pointer",
  fill: "#d00",
  stroke: "none"
};


class EventtPin extends Component {
  render() {
    const { size = 20, onClick } = this.props;

    return (
      <svg
        height={size}
        viewBox="0 0 24 24"
        style={{
          ...pinStyle,
          transform: `translate(${-size / 2}px,${-size}px)`
        }}
        onClick={onClick}
      >
        <path d={ICON} />
      </svg>
    );
  }
}


class EventInfo extends Component {
  render() {
    const { info } = this.props;
    const displayName = info.name;
    const url = info.url

    return (
      <div className="event-info-popup">
        <div>
          <span className="event-info-popup-title">{displayName}</span>
        </div>
        <div>
          <a
            target="_new"
            href={url}
          >
            View Details
          </a>
        </div>
      </div>
    );
  }
}


class WorldMap extends Component {

  state = { 
    viewport :{
      width: 1500,
      height: 750,
      latitude: 11.0,
      longitude: 9.0,
      zoom: 2,
      minZoom: 2
    },
    events: [],
    year: 1900,
    popupInfo: null,
  }

  componentDidMount() {
    this.updateEvents(this.state.year);
  }

  handleViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    })
  }

  handleSliderChange = changeEvent => {
    this.setState({
      year: Number(changeEvent.target.value),
      popupInfo: null 
    })
    this.updateEvents(changeEvent.target.value);
  }

  updateEvents = (year) => {
    axios.get(`http://127.0.0.1:${process.env.REACT_APP_SERVER_PORT}/events/${year}`)
      .then(res => {
        this.setState({
          events: res.data
        })
      })
  }

  _renderEventMarker = (event, index) => {
    return (
      <Marker latitude={event.latitude} longitude={event.longitude} key={`marker_${index}`} >
        <EventtPin size={20} onClick={() => this.setState({ popupInfo: event })} />
      </Marker>
    );
  };

  _renderPopup() {
    const { popupInfo } = this.state;

    return (
      popupInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          name={popupInfo.name}
          url={popupInfo.url}
          closeOnClick={false}
          onClose={() => this.setState({ popupInfo: null })}
        >
          <EventInfo info={popupInfo} />
        </Popup>
      )
    );
  }

  render() {

    const { viewport } = this.state;


    return (
      <div id="map-container">
        <ReactMapGL
          {...viewport}
          onViewportChange={this.handleViewportChange}
          width="90w"
          height="80vh"
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onClick={() => this.setState({ popupInfo: null })}
        >

        {this.state.events.map(this._renderEventMarker)}
        {this._renderPopup()}

        </ReactMapGL>

        <RangeSlider
          value={this.state.year}
          onChange={this.handleSliderChange}
          min={0}
          max={2020}
          size='lg'
        />

      </div>
    );
  }
}

export default WorldMap;
