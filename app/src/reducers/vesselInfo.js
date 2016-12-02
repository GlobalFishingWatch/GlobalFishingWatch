const initialState = {
  track: {},
  details: {},
  vesselVisibility: false
};
import {
  SET_VESSEL_DETAILS,
  SET_VESSEL_TRACK,
  RESET_VESSEL_DETAILS,
  SET_VESSEL_VISIBILITY,
  SHOW_VESSEL_CLUSTER_INFO
} from '../actions';

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_VESSEL_TRACK:
      return Object.assign({}, state, { track: action.payload });
    case SET_VESSEL_DETAILS: {
      const details = Object.assign({}, state.details, action.payload);
      return Object.assign({}, state, { details, vesselVisibility: true });
    }
    case RESET_VESSEL_DETAILS:
      return Object.assign({}, state, { details: action.payload });
    case SET_VESSEL_VISIBILITY: {
      return Object.assign({}, state, { vesselVisibility: action.payload });
    }
    case SHOW_VESSEL_CLUSTER_INFO: {
      return Object.assign({}, state, { details: { isCluster: true }, vesselVisibility: true });
    }
    default:
      return state;
  }
}
