import { Text, Pressable, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { Fonts, loadFonts } from '@/constants/GraphSettings';

export default (props) => {
    const { isFocused, label, routeName, color, icon } = props;

    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(
            isFocused ? 1 : 0,
            { duration: 350 }
        );
    }, [scale, isFocused]);

    return (
        <Pressable {...props} style={styles.container}>    
            <TabBarIcon name={icon} color={color} />
            <Text style={{ 
                color: color,
                fontSize: 13,
                fontFamily: Fonts.Title.Bold,
            }}>
                {label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    }
});
