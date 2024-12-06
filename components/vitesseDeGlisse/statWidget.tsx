import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/GraphSettings';

interface StatWidgetProps {
    topText: string;
    bottomText: string;
    topTextPosition: { top: number; left: number };
    bottomTextPosition: { top: number; left: number };
}

const StatWidget: React.FC<StatWidgetProps> = ({ 
    topText, 
    bottomText, 
    topTextPosition, 
    bottomTextPosition 
}) => {
    return (
        <View>
            <Text
                style={[
                    styles.topText,
                    { top: topTextPosition.top, left: topTextPosition.left }
                ]}
            >
                {topText}
            </Text>
            <Text
                style={[
                    styles.bottomText,
                    { top: bottomTextPosition.top, left: bottomTextPosition.left }
                ]}
            >
                {bottomText}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    topText: {
        position: 'absolute',
        color: Colors.white,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
    },
    bottomText: {
        position: 'absolute',
        color: Colors.white,
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: '400',
    },
});

export default StatWidget;