import React from 'react';
import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';

const WidgetBanal = ({ title, subtitles, backgroundColor, textColor, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, { backgroundColor }]} onPress={onPress} disabled={!onPress}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            {subtitles.map((subtitle, index) => (
                <Text key={index} style={[styles.subtitle, { color: textColor }]}>
                    {subtitle.text}
                    {subtitle.link && (
                        <Text
                            style={[styles.link, { color: textColor }]}
                            onPress={() => Linking.openURL(subtitle.link)}
                        >
                            {' '}
                            {subtitle.link}
                        </Text>
                    )}
                </Text>
            ))}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        marginVertical: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    link: {
        textDecorationLine: 'underline', // Souligner uniquement le lien
    },
});

export default WidgetBanal;