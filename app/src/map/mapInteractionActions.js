import area from '@turf/area';
import { clearVesselInfo, addVessel, hideVesselsInfoPanel } from 'vesselInfo/vesselInfoActions';
import { setEncountersInfo, clearEncountersInfo } from 'encounters/encountersActions';
import { clearHighlightedVessels, clearHighlightedClickedVessel } from 'activityLayers/heatmapActions';
import { zoomIntoVesselCenter } from 'map/mapViewportActions';
import { trackMapClicked } from 'analytics/analyticsActions';
import { setReportPolygon } from 'report/reportActions';
import { LAYER_TYPES } from 'constants';
import { POLYGON_LAYERS, POLYGON_LAYERS_AREA } from 'config';

export const SET_HOVER_POPUP = 'SET_HOVER_POPUP';
export const SET_POPUP = 'SET_POPUP';
export const CLEAR_POPUP = 'CLEAR_POPUP';
export const SET_MAP_CURSOR = 'SET_MAP_CURSOR';
export const UPDATE_POPUP_REPORT_STATUS = 'UPDATE_POPUP_REPORT_STATUS';

const getFeaturePopupFields = (staticLayerId) => {
  const popupFields = POLYGON_LAYERS[staticLayerId].popupFields;
  return popupFields;
};

const getAreaKm2 = (glFeature) => {
  const areakm2 = (10 ** -6) * area(glFeature.geometry);
  const formatted = areakm2.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return formatted;
};

const humanizePopupFieldId = id => id
  .replace(POLYGON_LAYERS_AREA, 'Est. area km²')
  .replace('_', ' ')
  .replace(/\b\w/g, l => l.toUpperCase());

const getStaticLayerIdFromGlFeature = glFeature => Object.keys(POLYGON_LAYERS).find(key =>
  POLYGON_LAYERS[key].glLayers.find(glLayer => glLayer.id === glFeature.layer.id)
);

const findFeature = (glFeatures, reportLayerId) => {
  if (!glFeatures.length) {
    return undefined;
  }
  if (reportLayerId === null) {
    // gl id might be not found if layer is custom, loop until found
    // FIXME implement popus for custom layers
    for (let i = 0; i < glFeatures.length; i++) {
      const glFeature = glFeatures[i];
      const staticLayerId = getStaticLayerIdFromGlFeature(glFeature);
      if (staticLayerId !== undefined) {
        return {
          feature: glFeature,
          staticLayerId
        };
      }
    }
    return undefined;
  }
  const reportLayerFeature = glFeatures.find((glFeature) => {
    const staticLayerId = getStaticLayerIdFromGlFeature(glFeature);
    return (staticLayerId === reportLayerId);
  });
  if (reportLayerFeature !== undefined) {
    return {
      feature: reportLayerFeature,
      staticLayerId: reportLayerId
    };
  }
  return undefined;
};

export const clearPopup = () => (dispatch) => {
  dispatch({
    type: CLEAR_POPUP
  });
};

export const mapHover = (latitude, longitude, features) => (dispatch, getState) => {
  const state = getState();
  const currentActivityLayersInteractionData = state.heatmap.highlightedVessels;
  const { layerId, isEmpty, foundVessels } = currentActivityLayersInteractionData;

  let hoverPopup = null;
  let cursor = null;

  const report = state.report;

  if (report.layerId !== null || isEmpty === true) {
    const feature = findFeature(features, report.layerId);
    if (feature !== undefined) {
      const layerIsInReport = report.layerId === feature.staticLayerId;
      if (FEATURE_FLAG_EXTENDED_POLYGON_LAYERS === true || layerIsInReport === true) {
        const popupFields = getFeaturePopupFields(feature.staticLayerId);
        const mainPopupFieldId = popupFields[0].id || popupFields[0];
        const featureTitle = feature.feature.properties[mainPopupFieldId];
        const staticLayer = state.layers.workspaceLayers.find(l => l.id === feature.staticLayerId);
        hoverPopup = {
          layerTitle: staticLayer.title,
          featureTitle
        };
        cursor = 'pointer';
      }
    }
  } else if (isEmpty !== true) {
    // if activity layers are found, and a report is not triggered on a static layer
    const layer = state.layers.workspaceLayers.find(l => l.id === layerId);
    cursor = (foundVessels === undefined || foundVessels.length > 1) ? 'zoom-in' : 'pointer';
    let featureTitle;
    if (foundVessels === undefined || foundVessels.length > 1) {
      featureTitle = `${(foundVessels === undefined) ? 'multiple' : foundVessels.length} vessels at this location`;
    } else {
      featureTitle = '1 vessel at this location';
    }

    hoverPopup = {
      layerTitle: layer.title,
      featureTitle
    };
  }

  if (hoverPopup !== null) {
    hoverPopup = {
      ...hoverPopup,
      latitude,
      longitude
    };
  }

  dispatch({
    type: SET_HOVER_POPUP,
    payload: hoverPopup
  });

  dispatch({
    type: SET_MAP_CURSOR,
    payload: cursor
  });
};

export const mapClick = (latitude, longitude, features) => (dispatch, getState) => {
  const state = getState();

  dispatch(clearVesselInfo());
  dispatch(clearEncountersInfo());
  dispatch(clearPopup());
  dispatch(clearHighlightedClickedVessel());

  const currentActivityLayersInteractionData = getState().heatmap.highlightedVessels;
  const { layerId, isEmpty, clickableCluster, foundVessels } = currentActivityLayersInteractionData;
  const layer = state.layers.workspaceLayers.find(l => l.id === layerId);

  const report = getState().report;

  if (report.layerId !== null || isEmpty === true) {
    const feature = findFeature(features, report.layerId);
    if (feature !== undefined) {
      const popupFields = getFeaturePopupFields(feature.staticLayerId);
      const staticLayer = getState().layers.workspaceLayers.find(l => l.id === feature.staticLayerId);

      const layerIsInReport = state.report.layerId === feature.staticLayerId;
      if (FEATURE_FLAG_EXTENDED_POLYGON_LAYERS === false && layerIsInReport === false) {
        return;
      }

      if (layerIsInReport === true) {
        dispatch(setReportPolygon(feature.feature.properties));
      }

      const fields = popupFields.map((popupField) => {
        const id = popupField.id || popupField;
        const value = (id === POLYGON_LAYERS_AREA) ? getAreaKm2(feature.feature) : feature.feature.properties[id];
        const title = popupField.label || humanizePopupFieldId(id);
        return {
          title,
          value
        };
      });

      const isInReport = (layerIsInReport === true) ? state.report.currentPolygon.isInReport : null;


      dispatch({
        type: SET_POPUP,
        payload: {
          layerId: feature.staticLayerId,
          layerTitle: staticLayer.title,
          fields,
          isInReport,
          latitude,
          longitude
        }
      });
    }
  } else if (
    isEmpty !== true &&
    state.user.userPermissions !== null &&
    state.user.userPermissions.indexOf('selectVessel') > -1
  ) {
    if (clickableCluster === true) {
      dispatch(trackMapClicked(latitude, longitude, 'cluster'));
      dispatch(hideVesselsInfoPanel());
      dispatch(zoomIntoVesselCenter(latitude, longitude));
      dispatch(clearHighlightedVessels());
    } else {
      dispatch(trackMapClicked(latitude, longitude, 'vessel'));
      const selectedSeries = foundVessels[0].series;
      const selectedSeriesgroup = foundVessels[0].seriesgroup;

      if (layer.subtype === LAYER_TYPES.Encounters) {
        dispatch(setEncountersInfo(selectedSeries, layer.tilesetId, layer.header.endpoints.info));
      } else {
        dispatch(addVessel(layer.tilesetId, selectedSeriesgroup, selectedSeries));
      }
    }
  }
};

export const updatePopupReportStatus = () => (dispatch, getState) => {
  const state = getState();
  const popup = state.mapInteraction.popup;
  if (popup === null) return;

  const layerIsInReport = state.report.layerId === popup.layerId;
  const polygonIsInReport = (layerIsInReport === true) ? state.report.currentPolygon.isInReport : null;

  dispatch({
    type: UPDATE_POPUP_REPORT_STATUS,
    payload: polygonIsInReport
  });
};
