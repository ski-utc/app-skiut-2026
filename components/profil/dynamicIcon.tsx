import React from 'react';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

interface IconProps {
    library: 'Feather' | 'FontAwesome' | 'MaterialCommunityIcons'; // Ajouter d'autres bibliothèques si nécessaire
    name: string;
    size?: number;
    color?: string;
}

const DynamicIcon: React.FC<IconProps> = ({ library, name, size = 20, color = 'black' }) => {
    switch (library) {
        case 'Feather':
            return <Feather name={name} size={size} color={color} />;
        case 'FontAwesome':
            return <FontAwesome name={name} size={size} color={color} />;
        case 'MaterialCommunityIcons':
            return <MaterialCommunityIcons name={name} size={size} color={color} />;
        default:
            return null; // Gérer une valeur par défaut si nécessaire
    }
};

export default DynamicIcon;