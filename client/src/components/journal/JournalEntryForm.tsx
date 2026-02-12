import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createEntry } from '../../store/journalSlice';
import { AppDispatch, RootState } from '../../store/store';
import { MoodSelector } from './MoodSelector';
import { CravingSlider } from './CravingSlider';

export const JournalEntryForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.journal);

    const [mood, setMood] = useState('neutral');
    const [cravingIntensity, setCravingIntensity] = useState(5);
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        const entryData = {
            mood,
            cravingIntensity,
            notes,
            triggers: [], // Can implement trigger selection later
        };

        const resultAction = await dispatch(createEntry(entryData));
        if (createEntry.fulfilled.match(resultAction)) {
            setNotes('');
            setMood('neutral');
            setCravingIntensity(5);
        }
    };

    return (
        <View style={styles.container}>
            <MoodSelector selectedMood={mood} onSelect={setMood} />
            <CravingSlider value={cravingIntensity} onValueChange={setCravingIntensity} />

            <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={styles.input}
            />

            <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
            >
                Save Entry
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    input: {
        marginVertical: 10,
    },
    button: {
        marginTop: 10,
    },
});
