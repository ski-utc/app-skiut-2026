import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Linking from 'expo-linking';
import { Phone } from "lucide-react-native";

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiGet, isSuccessResponse, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import BoutonRetour from "../../components/divers/boutonRetour";
import Header from "../../components/header";

type ContactInterface = {
    name: string;
    role?: string | null;
    phoneNumber: string;
}

export default function Contact() {
    const [contacts, setContacts] = useState<ContactInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const { setUser } = useUser();

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiGet<ContactInterface[]>('contacts');

            if (isSuccessResponse(response)) {
                setContacts(response.data || []);
            }
        } catch (err: unknown) {
            handleApiErrorScreen(err, setUser, setError);
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const makeCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const renderItem = ({ item }: { item: ContactInterface }) => (
        <TouchableOpacity
            style={styles.contactCard}
            onPress={() => makeCall(item.phoneNumber)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Phone size={18} color={Colors.primary} />
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.contactName} numberOfLines={2}>
                    {item.name}
                </Text>
                {item.role && (
                    <Text style={styles.contactRole} numberOfLines={1}>
                        {item.role}
                    </Text>
                )}
                <Text style={styles.contactPhone} numberOfLines={1}>
                    {item.phoneNumber}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <ErrorScreen error={error} />
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={styles.loadingText}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={fetchContacts} disableRefresh={false} />

            <View style={styles.content}>
                <BoutonRetour
                    title={"Contact"}
                />
                <FlatList
                    data={contacts}
                    keyExtractor={(item, index) => `${item.name}-${index}`}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Aucun contact disponible
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContent: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 12,
    },
    contactCard: {
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        elevation: 3,
        flex: 1,
        marginHorizontal: 6,
        minHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    contactName: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 4,
        textAlign: 'center',
    },
    contactPhone: {
        ...TextStyles.small,
        color: Colors.muted,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    contactRole: {
        ...TextStyles.small,
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
        textAlign: 'center',
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        backgroundColor: Colors.white,
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyText: {
        ...TextStyles.bodyLarge,
        color: Colors.muted,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    listContainer: {
        paddingBottom: 20,
    },
    loadingContent: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});
