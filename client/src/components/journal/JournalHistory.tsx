import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntries, deleteEntry } from '../../store/journalSlice';
import { AppDispatch, RootState } from '../../store/store';

export const JournalHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { entries } = useSelector((state: RootState) => state.journal);

    useEffect(() => {
        dispatch(fetchEntries({ page: 1, limit: 20 }));
    }, [dispatch]);

    const handleDelete = (id: string) => {
        dispatch(deleteEntry(id));
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <Card.Title
                title={`${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)} - Intensity: ${item.cravingIntensity}`}
                subtitle={new Date(item.date).toLocaleString()}
                right={(props) => <IconButton {...props} icon="delete" onPress={() => handleDelete(item._id)} />}
            />
            {item.notes ? <Card.Content><Text>{item.notes}</Text></Card.Content> : null}
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.title}>Recent Entries</Text>
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false} // Since it's inside a ScrollView in JournalScreen
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        marginBottom: 10,
    },
    card: {
        marginBottom: 10,
    },
});
