import { connect } from 'react-redux';
import Fleet from 'fleets/components/Fleet';
import {
  toggleFleetVisibility,
  startEditingFleet
} from 'fleets/fleetsActions';

const mapDispatchToProps = dispatch => ({
  toggle(id) {
    dispatch(toggleFleetVisibility(id));
  },
  startEditingFleet: (fleetId) => {
    dispatch(startEditingFleet(fleetId));
  }
});

export default connect(mapDispatchToProps, mapDispatchToProps)(Fleet);
