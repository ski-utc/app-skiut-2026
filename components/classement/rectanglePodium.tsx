import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

const screenWidth = Dimensions.get('window').width;
const containerWidth = screenWidth / 3 - 10; // Less margin for a bit of space

interface RectanglePodiumProps {
    height: number;
    num: string; // Room name 
    nb_likes: number;
    style?: ViewStyle;
}

const RectanglePodium: React.FC<RectanglePodiumProps> = ({ height, num, nb_likes, style }) => {
    // Dynamically calculate font size based on name length
    const isLongName = num.length > 9; // Change this length limit as needed
    const textStyle = isLongName ? styles.longText : styles.text;

    return (
        <View style={[styles.container, style]}>
            <Text style={textStyle} numberOfLines={2}>{`Chambre ${num}`}</Text>
            <Text style={styles.likesText}>{nb_likes} points</Text>
            <View style={[styles.rectangle, { height }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: containerWidth, // Use the calculated width
        paddingHorizontal: 10,
        marginHorizontal: 5,
    },
    text: {
        color: Colors.white,
        fontSize: 16, // Default font size
        fontFamily: Fonts.Text.Medium,
        textAlign: 'center',
        width: '100%',
        flexWrap: 'wrap',
        marginVertical: 4,
    },
    longText: {
        color: Colors.white,
        fontSize: 12, // Smaller font size for longer names
        fontFamily: Fonts.Text.Medium,
        textAlign: 'center',
        width: '100%',
        flexWrap: 'wrap',
        marginVertical: 4,
    },
    likesText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Fonts.Text.Light,
    },
    rectangle: {
        width: '100%',
        backgroundColor: Colors.lightOrange,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginHorizontal: 4,
        marginTop: 4,
    },
});

export default RectanglePodium;
