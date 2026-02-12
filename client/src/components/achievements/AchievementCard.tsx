import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';

interface AchievementCardProps {
    name: string;
    description: string;
    isUnlocked: boolean;
    unlockedAt?: string;
    type: 'streak' | 'savings' | 'reduction' | 'milestone';
}

export const AchievementCard = ({ name, description, isUnlocked, unlockedAt, type }: AchievementCardProps) => {
    const theme = useTheme();

    const getIcon = () => {
        switch (type) {
            case 'streak': return 'fire';
            case 'savings': return 'piggy-bank';
            case 'reduction': return 'trending-down';
            case 'milestone': return 'trophy';
            default: return 'star';
        }
    };

    return (
        <Card style={[styles.card, !isUnlocked && styles.lockedCard]}>
            <Card.Content style={styles.content}>
                <View style={styles.iconContainer}>
                    <Avatar.Icon
                        size={50}
                        icon={getIcon()}
                        style={{ backgroundColor: isUnlocked ? theme.colors.primary : '#bdbdbd' }}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={{ color: isUnlocked ? '#000' : '#757575' }}>{name}</Text>
                    <Text variant="bodyMedium" style={{ color: isUnlocked ? '#424242' : '#9e9e9e' }}>{description}</Text>
                    {isUnlocked && unlockedAt && (
                        <Text variant="labelSmall" style={styles.date}>
                            Unlocked: {new Date(unlockedAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    lockedCard: {
        backgroundColor: '#f5f5f5',
        opacity: 0.8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    date: {
        marginTop: 4,
        color: '#4caf50',
    },
});
