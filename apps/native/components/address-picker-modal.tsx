import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, Platform, ScrollView } from "react-native";
import * as Location from "expo-location";

export type PickerResult = {
  address: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

type Suggestion = PickerResult & { id: string; label: string };

export function AddressPickerModal({
  visible,
  onClose,
  onPicked,
  initialQuery = "",
}: {
  visible: boolean;
  onClose: () => void;
  onPicked: (val: PickerResult) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setQuery(initialQuery);
  }, [visible, initialQuery]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        if (Platform.OS === 'ios') {
          const results = await Location.geocodeAsync(query);
          const limited = results.slice(0, 6);
          const mapped: Suggestion[] = await Promise.all(
            limited.map(async (r, idx) => {
              try {
                const rev = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
                const first = rev[0];
                const streetLine = [first?.name].filter(Boolean).join(' ');
                const parts = [streetLine, first?.postalCode, first?.city].filter(Boolean) as string[];
                return {
                  id: `${r.latitude},${r.longitude}-${idx}`,
                  label: parts.length > 0 ? parts.join(' ') : `${r.latitude}, ${r.longitude}`,
                  address: streetLine || `${r.latitude}, ${r.longitude}`,
                  city: first?.city || undefined,
                  postalCode: first?.postalCode || undefined,
                  latitude: r.latitude,
                  longitude: r.longitude,
                } as Suggestion;
              } catch {
                return {
                  id: `${r.latitude},${r.longitude}-${idx}`,
                  label: `${r.latitude}, ${r.longitude}`,
                  address: `${r.latitude}, ${r.longitude}`,
                  city: undefined,
                  postalCode: undefined,
                  latitude: r.latitude,
                  longitude: r.longitude,
                } as Suggestion;
              }
            })
          );
          setSuggestions(mapped);
        } else {
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`;
          const res = await fetch(url, { headers: { "User-Agent": "SpringEin/1.0 (contact: support@springein.app)" } });
          if (res.ok) {
            const data = (await res.json()) as Array<any>;
            const mapped: Suggestion[] = data.map((d: any) => {
              const streetLine = [d?.address?.road, d?.address?.house_number].filter(Boolean).join(' ');
              return {
                id: String(d.place_id),
                label: d.display_name,
                address: streetLine || d.display_name,
                city: d?.address?.city || d?.address?.town || d?.address?.village || undefined,
                postalCode: d?.address?.postcode,
                latitude: d?.lat ? Number(d.lat) : undefined,
                longitude: d?.lon ? Number(d.lon) : undefined,
              } as Suggestion;
            });
            setSuggestions(mapped);
          } else {
            setSuggestions([]);
          }
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, visible]);

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const first = rev[0];
      const addressLine = [first?.name, first?.postalCode, first?.city]
        .filter(Boolean)
        .join(" ");
      onPicked({
        address: addressLine,
        city: first?.city || undefined,
        postalCode: first?.postalCode || undefined,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      onClose();
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="px-4 pt-4 pb-2 border-b border-gray-200">
          <Text className="text-xl font-bold">Adresse auswählen</Text>
          <View className="flex-row gap-2 mt-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Adresse suchen"
              className="border border-gray-300 rounded-lg p-3 flex-1 bg-white"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Pressable onPress={onClose} className="border border-gray-300 rounded-lg px-3 justify-center">
              <Text className="text-gray-900">Schließen</Text>
            </Pressable>
          </View>
          <Pressable onPress={useCurrentLocation} className="mt-2 self-start">
            <Text className="text-gray-600 text-xs underline">Aktuellen Standort verwenden</Text>
          </Pressable>
        </View>
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {loading && <Text className="text-gray-500 text-sm px-4 py-3">Lade Vorschläge…</Text>}
          {!loading && suggestions.map((s) => (
            <Pressable key={s.id} onPress={() => { onPicked({ address: s.address, city: s.city, postalCode: s.postalCode, latitude: s.latitude, longitude: s.longitude }); onClose(); }} className="px-4 py-3 border-b border-gray-100">
              <Text className="text-gray-900" numberOfLines={2}>{s.label}</Text>
              {s.city || s.postalCode ? (
                <Text className="text-gray-500 text-xs mt-1">{[s.postalCode, s.city].filter(Boolean).join(' ')}</Text>
              ) : null}
            </Pressable>
          ))}
          {!loading && suggestions.length === 0 && (
            <Text className="text-gray-500 text-sm px-4 py-4">Mindestens 3 Zeichen eingeben…</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}


