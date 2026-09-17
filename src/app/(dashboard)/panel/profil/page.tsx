"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VOIVODESHIPS } from "@/lib/utils";
import { useSession } from "next-auth/react";

const profileSchema = z.object({
  name: z.string().min(3, "Nazwa jest wymagana"),
  nip: z.string().min(10, "Nieprawidłowy NIP"),
  regon: z.string().optional(),
  krs: z.string().optional(),
  address: z.string().min(3, "Adres jest wymagany"),
  city: z.string().min(2, "Miasto jest wymagane"),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: XX-XXX"),
  voivodeship: z.string().min(1, "Województwo jest wymagane"),
  email: z.string().email("Nieprawidłowy email"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileFormValues | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const voivodeshipValue = watch("voivodeship");

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetch(`/api/organizations/${session.user.organizationId}`)
        .then(res => {
          if (!res.ok) throw new Error("Nie udało się pobrać danych organizacji");
          return res.json();
        })
        .then(data => {
          const profileData = {
            name: data.name || "",
            nip: data.nip || "",
            regon: data.regon || "",
            krs: data.krs || "",
            address: data.address || "",
            city: data.city || "",
            postalCode: data.postalCode || "",
            voivodeship: data.voivodeship || "",
            email: data.email || "",
            phone: data.phone || "",
          };
          setProfile(profileData);
          reset(profileData);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [session, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!session?.user?.organizationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${session.user.organizationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Błąd podczas zapisywania");

      setProfile(data);
      setIsEditing(false);
      alert("Pomyślnie zapisano zmiany."); // Simple toast
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-navy-800" /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-900">Profil organizacji</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-[#145447] hover:bg-[#0D4036] text-white">
            <Edit2 className="w-4 h-4 mr-2" /> Edytuj dane
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane podstawowe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Pełna nazwa</Label>
                <Input id="name" disabled={!isEditing} {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" disabled={!isEditing} {...register("nip")} />
                {errors.nip && <p className="text-red-500 text-sm">{errors.nip.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regon">REGON</Label>
                <Input id="regon" disabled={!isEditing} {...register("regon")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="krs">KRS (opcjonalnie)</Label>
                <Input id="krs" disabled={!isEditing} {...register("krs")} />
              </div>
            </div>

            <h3 className="text-lg font-medium pt-4 border-t">Dane adresowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adres (ulica, nr budynku/lokalu)</Label>
                <Input id="address" disabled={!isEditing} {...register("address")} />
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Kod pocztowy</Label>
                <Input id="postalCode" disabled={!isEditing} {...register("postalCode")} />
                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Miejscowość</Label>
                <Input id="city" disabled={!isEditing} {...register("city")} />
                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="voivodeship">Województwo</Label>
                <Select
                  disabled={!isEditing}
                  value={voivodeshipValue}
                  onValueChange={(val) => setValue("voivodeship", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz województwo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOIVODESHIPS?.map((v: string) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    )) || (
                      <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.voivodeship && <p className="text-red-500 text-sm">{errors.voivodeship.message}</p>}
              </div>
            </div>

            <h3 className="text-lg font-medium pt-4 border-t">Dane kontaktowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" disabled={!isEditing} {...register("email")} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" disabled={!isEditing} {...register("phone")} />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (profile) reset(profile);
                    setIsEditing(false);
                  }}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" /> Anuluj
                </Button>
                <Button
                  type="submit"
                  className="bg-[#145447] hover:bg-[#0D4036] text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Zapisz zmiany
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
