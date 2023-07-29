import React, {useEffect} from 'react';
import {ScrollView } from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from './Text';
import ONYXKEYS from '../ONYXKEYS';
import createInitialWaypoints from '../libs/actions/Transaction';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';


const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        transactionID: PropTypes.string,
        comment: PropTypes.shape({
            waypoints: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
                address: PropTypes.string,
            })
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    transactionID: '',
    transaction: {},
};

function DistanceRequest({transaction, transactionID, translate}) {
    const waypoints = lodashGet(transaction, 'comment.waypoints', {}) ;
    const lastWaypointIndex = _.size(waypoints) - 1;

    useEffect(() => {
        if (!transaction.transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        createInitialWaypoints(transaction.transactionID);
    }, [transaction.transactionID, waypoints]);

    return (
        <ScrollView>
            {_.map(waypoints, (waypoint, key) => {
                // key is of the form waypoint0, waypoint1, ...
                const index = Number(key.replace('waypoint', ''));
                let descriptionKey = 'distance.waypointDescription.';
                if (index === 0) {
                    descriptionKey += 'start';
                } else if (index === lastWaypointIndex) {
                    descriptionKey += 'finish';
                } else {
                    descriptionKey += 'stop';
                }

                return <MenuItemWithTopDescription description={translate(descriptionKey)} icon={Expensicons.Menu} secondaryIcon={Expensicons.DotIndicator} secondaryIconFill={theme.icon} shouldShowRightIcon/>;
            })}
            <Text>Distance Request</Text>
            <Text>transactionID: {transactionID}</Text>
        </ScrollView>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        transaction: {key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`, selector: (transaction) => ({transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}})},
    })
)(DistanceRequest);
