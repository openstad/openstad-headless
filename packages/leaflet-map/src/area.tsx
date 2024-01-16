import { useState, useEffect, useImperativeHandle } from 'react';
import { polygon } from 'leaflet';
import { Polygon } from 'react-leaflet';
import { AreaProps } from './types/area-props';
import { Location } from './types/location';

function createCutoutPolygon(area: Location[]) {

	// polygon must defined from the south west corner to work with the outer box
	let bounds = polygon(area).getBounds();
	let center = bounds.getCenter();

	let smallest = 0; let index = 0;

	area.forEach(function( point: Location, i: number ) {
		let y = Math.sin(point.lng-center.lng) * Math.cos(point.lat);
		let x = Math.cos(center.lat)*Math.sin(point.lat) - Math.sin(center.lat)*Math.cos(point.lat)*Math.cos(point.lng-center.lng);
		let bearing = Math.atan2(y, x) * 180 / Math.PI;
		if (45 - bearing < smallest) {
			smallest = 45 - bearing;
			index = i;
		}
	});

	let a = area.slice(0, index);
	let b = area.slice(index, area.length);
	area = b.concat(a);

	// outer box
	// TODO: should be calculated dynamically from the center point
	let delta1: number = 0.01;
	let delta2: number = 5;
	let outerBox: Location[] = [
		{lat: -90 + delta2, lng:  -180 + delta1 },
		{lat: -90 + delta2, lng:     0          },
		{lat: -90 + delta2, lng:   180 - delta1 },
		{lat:   0,          lng:   180 - delta1 },
		{lat:  90 - delta2, lng:   180 - delta1 },
		{lat:  90 - delta2, lng:     0          },
		{lat:  90 - delta2, lng:  -180 + delta1 },
		{lat:  90 - delta2, lng:  -180 + delta1 },
		{lat:   0,          lng:  -180 + delta1 },
	];

  let result:any = [
    outerBox.map(obj => [obj.lat, obj.lng]),
    area.map(obj => [obj.lat, obj.lng])
  ];

  return result;

}

export function isPointInArea(area: Location[], point: Location) {

  if (!point) return false;
  if (!area) return true;

	// taken from http://pietschsoft.com/post/2008/07/02/Virtual-Earth-Polygon-Search-Is-Point-Within-Polygon

  let x = point.lat, y = point.lng;

  let inside = false;
  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    let xi = area[i].lat, yi = area[i].lng;
    let xj = area[j].lat, yj = area[j].lng;

    let intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside; 

}

export function Area({
  area = null,
  areaPolygonStyle = {
		"color": "#d00",
		"fillColor": "#000",
		"fillOpacity": 0.15
	},
  ...props
}: AreaProps) {

  let [currentArea, setCurrentArea] = useState(area);
  
  useEffect(() => {
    let polygon = createCutoutPolygon(currentArea);
    setCurrentArea(polygon)
  }, [area]);
  
  return (
    <Polygon {...props} positions={currentArea} pathOptions={areaPolygonStyle}/>
  );

}

export default Area;

