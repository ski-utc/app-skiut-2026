import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react';
import DynamicIcon from './dynamicIcon'; // Importer le composant d'icône dynamique

interface BoutonProfilprops {
    nextRoute: string;
    profil: {
        title: string;
        iconName: string;
        iconLibrary: 'Feather' | 'FontAwesome' | 'MaterialCommunityIcons'; // Ajoutez d'autres bibliothèques si nécessaire
    };
}

const BoutonProfil: React.FC<BoutonProfilprops> = ({ nextRoute, profil }) => {
    const navigation = useNavigation();

    const onPress = () => {
        navigation.navigate(nextRoute);
    };

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.icon}>
                    <DynamicIcon 
                        library={profil.iconLibrary} 
                        name={profil.iconName} 
                        size={20} 
                        color={Colors.gray} 
                    />
                </View>
                <Text style={styles.title}>{profil.title}</Text>
            </View>
            <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        gap:10
    },
    title: {
        color: "#1E1E1E",
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: "500",
        flex: 8
    },
    icon: {
        flex:1,
        alignItems: "center"
    }
});

export default BoutonProfil;