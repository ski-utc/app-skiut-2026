import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonProps {
    first: string;
    second: string;
    third: string;
    onFirstClick: () => void;
    onSecondClick: () => void;
    onThirdClick: () => void;
}

const BoutonMenu: React.FC<ButtonProps> = ({
    first,
    second,
    third,
    onFirstClick,
    onSecondClick,
    onThirdClick,
}) => {
    const [activeButton, setActiveButton] = useState<string>('first');

    const handleButtonClick = (button: string, onClick: () => void) => {
        setActiveButton(button);
        onClick();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    activeButton === 'first' && styles.activeButton,
                ]}
                onPress={() => handleButtonClick('first', onFirstClick)}
            >
                <Text style={styles.text}>{first}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    activeButton === 'second' && styles.activeButton,
                ]}
                onPress={() => handleButtonClick('second', onSecondClick)}
            >
                <Text style={styles.text}>{second}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    activeButton === 'third' && styles.activeButton,
                ]}
                onPress={() => handleButtonClick('third', onThirdClick)}
            >
                <Text style={styles.text}>{third}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: '#EAEAEA',
        backgroundColor: '#FFFFFF',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    activeButton: {
        borderBottomWidth: 2,
        borderBottomColor: '#E64034',
        backgroundColor: '#F9F9F9',
    },
    text: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default BoutonMenu;
