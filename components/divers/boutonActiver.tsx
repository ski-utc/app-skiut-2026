import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonActiver({ 
    title, 
    IconComponent, 
    onPress = () => {}, 
    disabled = false, 
    customStyles = {} 
}) {
    return (
        <TouchableOpacity
            onPress={disabled ? null : onPress} // Désactive l'action si `disabled`
            style={[
                {
                    padding: 10,
                    backgroundColor: disabled ? '#B0B0B0' : '#E64034', // Couleur grise si désactivé
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 10,
                    opacity: disabled ? 0.5 : 1, // Réduit l'opacité si désactivé
                },
                customStyles, // Styles supplémentaires
            ]}
            activeOpacity={disabled ? 1 : 0.7} // Aucun effet de clic si désactivé
            disabled={disabled} // Empêche le clic
        >
            <Text
                style={{
                    color: 'white',
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '600',
                }}
            >
                {title}
            </Text>
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.white}
                />
            )}
        </TouchableOpacity>
    );
};
