import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface BoutonLancerProps {
    title: string;
}

export default function BoutonLancer({ title }: BoutonLancerProps) {
    return (
        <TouchableOpacity
            style={{
                padding: 10,
                backgroundColor: Colors.white,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text
                style={{
                    color: Colors.black,
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '600',
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};
