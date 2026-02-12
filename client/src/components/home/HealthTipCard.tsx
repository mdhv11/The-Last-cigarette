import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const HealthTipCard = () => {
    const { dashboard } = useSelector((state: RootState) => state.stats);

    if (!dashboard || !dashboard.healthTip) return null;

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Did you know?"
                left={(props) => <Avatar.Icon {...props} icon="heart-pulse" />}
            />
            <Card.Content>
                <Text variant="bodyLarge">{dashboard?.healthTip}</Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        marginVertical: 10,
    },
});
