import fetchEndpoint from 'utils/fetchEndpoint';
import { loadTrack, removeTracks } from 'src/_map/actions/mapTracksActions';
import { highlightClickedVessel, clearHighlightedClickedVessel } from 'activityLayers/heatmapActions';
import { VESSEL_TYPE_REEFER } from 'constants';
import { ENCOUNTERS_VESSEL_COLOR, ENCOUNTERS_REEFER_COLOR } from 'config';
import buildEndpoint from 'utils/buildEndpoint';

export const LOAD_ENCOUNTERS_INFO = 'LOAD_ENCOUNTERS_INFO';
export const SET_ENCOUNTERS_INFO = 'SET_ENCOUNTERS_INFO';
export const SET_ENCOUNTERS_VESSEL_INFO = 'SET_ENCOUNTERS_VESSEL_INFO';
export const CLEAR_ENCOUNTERS_INFO = 'CLEAR_ENCOUNTERS_INFO';
export const HIDE_ENCOUNTERS_INFO_PANEL = 'HIDE_ENCOUNTERS_INFO_PANEL';

export function hideEncountersInfoPanel() {
  return {
    type: HIDE_ENCOUNTERS_INFO_PANEL
  };
}

export function clearEncountersInfo() {
  return (dispatch, getState) => {
    const currentEncountersInfo = getState().encounters.encountersInfo;
    dispatch({
      type: CLEAR_ENCOUNTERS_INFO
    });
    dispatch(clearHighlightedClickedVessel());
    if (currentEncountersInfo !== null) {
      const removedTracks = currentEncountersInfo.vessels.map(v => ({ seriesgroup: v.seriesgroup }));
      dispatch(removeTracks(removedTracks));
    }
  };
}

export function setEncountersInfo(seriesgroup, tilesetId) {
  return (dispatch, getState) => {
    const workspaceLayers = getState().layers.workspaceLayers;
    const encounterLayer = workspaceLayers.find(l => l.tilesetId === tilesetId);

    dispatch(highlightClickedVessel(seriesgroup, encounterLayer.id));

    if (encounterLayer.header.endpoints === undefined || encounterLayer.header.endpoints.info === undefined) {
      console.warn('Info field is missing on header\'s urls, can\'t display encounters details');
      return;
    }
    const encounterInfoEndpoint = encounterLayer.header.endpoints.info;

    dispatch({
      type: LOAD_ENCOUNTERS_INFO,
      payload: {
        seriesgroup,
        tilesetId
      }
    });

    const infoUrl = buildEndpoint(encounterInfoEndpoint, {
      id: seriesgroup
    });
    const token = getState().user.token;

    fetchEndpoint(infoUrl, token).then((encounterInfo) => {
      encounterInfo.vessels = [{
        tilesetId: encounterInfo.vessel_1_tileset,
        seriesgroup: encounterInfo.vessel_1_id,
        vesselTypeName: encounterInfo.vessel_1_type,
        color: (encounterInfo.vessel_1_type === VESSEL_TYPE_REEFER) ? ENCOUNTERS_REEFER_COLOR : ENCOUNTERS_VESSEL_COLOR
      }, {
        tilesetId: encounterInfo.vessel_2_tileset,
        seriesgroup: encounterInfo.vessel_2_id,
        vesselTypeName: encounterInfo.vessel_2_type,
        color: (encounterInfo.vessel_2_type === VESSEL_TYPE_REEFER) ? ENCOUNTERS_REEFER_COLOR : ENCOUNTERS_VESSEL_COLOR
      }];

      dispatch({
        type: SET_ENCOUNTERS_INFO,
        payload: {
          encounterInfo
        }
      });

      encounterInfo.vessels.forEach((vessel) => {
        const vesselWorkspaceLayer = workspaceLayers.find(workspaceLayer =>
          workspaceLayer.tilesetId === vessel.tilesetId || workspaceLayer.id === vessel.tilesetId);
        const fields = vesselWorkspaceLayer.header.info.fields;
        fetchEndpoint(buildEndpoint(vesselWorkspaceLayer.header.endpoints.info, { id: vessel.seriesgroup }), token)
          .then((vesselInfo) => {
            dispatch({
              type: SET_ENCOUNTERS_VESSEL_INFO,
              payload: {
                seriesgroup: vessel.seriesgroup,
                vesselInfo,
                fields
              }
            });
          });

        const currentLayer = getState().layers.workspaceLayers.find(layer => layer.tilesetId === vessel.tilesetId);
        const header = currentLayer.header;
        const layerTemporalExtents = header.temporalExtents;
        const url = header.endpoints.tracks;

        dispatch(loadTrack({
          seriesgroup: vessel.seriesgroup,
          series: null,
          url,
          layerTemporalExtents,
          token
        }));
      });
    });
  };
}
