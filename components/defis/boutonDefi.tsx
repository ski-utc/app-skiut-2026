import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Check } from 'lucide-react';

interface BoutonDefiProps {
    nextRoute: string;
    defi: {
        title: string;
        details: string;
    };
    estValide: boolean;
}

const BoutonDefi: React.FC<BoutonDefiProps> = ({ nextRoute, defi, estValide }) => {
    const navigation = useNavigation();

    const onPress = () => {
        navigation.navigate(nextRoute, {
            transmittedText1: defi.title,
            transmittedText2: defi.details,
        });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: "100%",
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 14,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#EAEAEA",
                justifyContent: "space-between",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                backgroundColor: 'white',
            }}
        >
            {/* Partie gauche : icône et titre */}
            <View
                style={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    width: '85%',
                }}
            >
                <Check
                    color={estValide ? "#05AA1F" : "#8A8A8A"}
                    size={20}
                />
                <Text
                    style={{
                        color: "#1E1E1E",
                        fontSize: 14,
                        fontFamily: Fonts.Inter.Basic,
                        fontWeight: "500",
                        marginLeft: 10,
                    }}
                >
                    {defi.title}
                </Text>
            </View>

            {/* Icône flèche à droite */}
            <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>
    );
};

export default BoutonDefi;