import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

interface BoutonAdminProps {
    nextRoute: string;
    title: string;
}

const BoutonAdmin: React.FC<BoutonAdminProps> = ({ nextRoute, title }) => {
    const navigation = useNavigation();

    const onPress = () => {
        navigation.navigate(nextRoute);
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

                <Text
                    style={{
                        color: "#1E1E1E",
                        ...TextStyles.bodyLarge,
                        fontWeight: "500",
                        marginLeft: 10,
                    }}
                >
                    {title}
                </Text>
            </View>

            {/* Icône flèche à droite */}
            <ChevronRight size={20} color={'#000000'} />
        </TouchableOpacity>
    );
};

export default BoutonAdmin;