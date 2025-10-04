import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, FlatList } from "react-native";
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from "../../components/divers/boutonRetour";
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

// Composant NavettesTab - utilisé uniquement dans cette page
interface NavettesTabProps {
    navettesMap: { [key: string]: any[] };
    defaultType: "Aller" | "Retour";
    isAllerEmpty: boolean;
    isRetourEmpty: boolean;
}

const NavettesTab: React.FC<NavettesTabProps> = ({ navettesMap, defaultType, isAllerEmpty, isRetourEmpty }) => {
    const [selectedType, setSelectedType] = useState<"Aller" | "Retour">(defaultType);

    useEffect(() => {
        setSelectedType(defaultType);
    }, [defaultType]);

    const handlePress = (type: "Aller" | "Retour") => {
        setSelectedType(type);
    };

    const getColorFromString = (colorString: string) => {
        switch (colorString) {
            case 'Blue':
                return Colors.primary;
            case 'Green':
                return Colors.success;
            case 'Red':
                return Colors.error;
            case 'Yellow':
                return Colors.yellow;
            case 'Violet':
                return Colors.violet;
            case 'Orange':
                return Colors.accent;
            default:
                return Colors.primaryBorder;
        }
    };

    return (
        <View style={navettesStyles.container}>
            <View style={navettesStyles.innerContainer}>
                <View style={navettesStyles.buttonsContainer}>
                    {["Aller", "Retour"].map((type, index) => {
                        const isSelected = selectedType === type;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    navettesStyles.button,
                                    { backgroundColor: isSelected ? Colors.accent : Colors.white }
                                ]}
                                onPress={() => handlePress(type as "Aller" | "Retour")}
                            >
                                <Text style={[
                                    navettesStyles.buttonText,
                                    { color: isSelected ? Colors.white : Colors.primaryBorder }
                                ]}>
                                    {type.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {selectedType && (
                    <View style={navettesStyles.navettesContainer}>
                        <FlatList
                            data={navettesMap[selectedType] || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={navettesStyles.navetteContainer}>
                                    <View style={[navettesStyles.navetteIndicator, { backgroundColor: getColorFromString(item.colour) }]} />
                                    <View style={navettesStyles.navetteDetails}>
                                        <Text style={navettesStyles.navetteText}>
                                            {item.departure} → {item.arrival}
                                        </Text>
                                        <Text style={navettesStyles.navetteTimeText}>
                                            {item.horaire_depart} - {item.horaire_arrivee}
                                        </Text>
                                        <Text style={navettesStyles.navetteCouleurText}>
                                            Ligne {item.colour}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={navettesStyles.emptyText}>
                                    {selectedType === "Aller" && isAllerEmpty
                                        ? "Aucune navette aller disponible."
                                        : selectedType === "Retour" && isRetourEmpty
                                        ? "Aucune navette retour disponible."
                                        : "Chargement des navettes..."}
                                </Text>
                            }
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

// Syles pour NavettesTab
const navettesStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    innerContainer: {
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.accent,
        overflow: 'hidden',
        marginBottom: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        ...TextStyles.body,
        fontWeight: '600',
    },
    navettesContainer: {
        flex: 1,
    },
    navetteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    navetteIndicator: {
        width: 4,
        height: '100%',
        borderRadius: 2,
        marginRight: 12,
        minHeight: 40,
    },
    navetteDetails: {
        flex: 1,
    },
    navetteText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginBottom: 4,
    },
    navetteTimeText: {
        ...TextStyles.small,
        color: Colors.gray,
        marginBottom: 2,
    },
    navetteCouleurText: {
        ...TextStyles.small,
        color: Colors.accent,
        fontWeight: '500',
    },
    emptyText: {
        ...TextStyles.bodyLarge,
        color: Colors.gray,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default function NavettesScreen() {
  const [navettesMap, setNavettesMap] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [defaultType, setDefaultType] = useState<"Aller" | "Retour">("Aller");
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();

  const fetchNavettes = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('getNavettes');
      if (response.success) {
        const map = {
          Aller: [],
          Retour: [],
        };

        Object.keys(response.data).forEach((type) => {
          response.data[type].forEach((navette) => {
            const formattedNavette = {
              ...navette,
              horaire_depart: navette.horaire_depart,
              horaire_arrivee: navette.horaire_arrivee,
            };
            map[type].push(formattedNavette);
          });
        });

        setNavettesMap(map);
      } else {
        setError(response.message);
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    const today = new Date();
    const cutoffDate = new Date("2025-01-22");

    if (today >= cutoffDate) {
      setDefaultType("Retour");
    } else {
      setDefaultType("Aller");
    }

    fetchNavettes();
  }, [fetchNavettes]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header refreshFunction={null} disableRefresh={true} />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

  // Check if the navettes map for the selected type is empty
  const isAllerEmpty = navettesMap['Aller'].length === 0;
  const isRetourEmpty = navettesMap['Retour'].length === 0;

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchNavettes} disableRefresh={disableRefresh} />
      <View style={styles.content}>
        <BoutonRetour previousRoute="ProfilScreen" title="Navettes" />
        <NavettesTab
          navettesMap={navettesMap}
          defaultType={defaultType}
          isAllerEmpty={isAllerEmpty}
          isRetourEmpty={isRetourEmpty}
        />

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 20,
  }
});
