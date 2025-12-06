"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authService, AuthUser } from "@/services/auth.service";
import { toast } from "sonner";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Award,
  Trophy,
  Crown,
  Edit,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function UserProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getMe();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage your profile information
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Card with Banner */}
      <Card className="overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
          {user.banner ? (
            <Image
              src={user.banner}
              alt="Profile Banner"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-10">🎓</div>
            </div>
          )}
          {/* Premium Badge on Banner */}
          {user.isPremium && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-500 text-white">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <CardContent className="relative pt-0 px-4 sm:px-6 pb-6">
          {/* Avatar - Centered and Overlapping Banner */}
          <div className="flex justify-center sm:justify-start -mt-16 sm:-mt-20 mb-4">
            <div className="relative shrink-0">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden bg-background border-4 border-background shadow-xl">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                    <User className="h-16 w-16 sm:h-20 sm:w-20" />
                  </div>
                )}
              </div>
              {/* Verification Badge */}
              {user.verifyBadge && (
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5 border-2 border-background shadow-lg">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* User Details - Below Avatar */}
          <div className="space-y-4">
            {/* Name and Status */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground wrap-break-word">{user.name}</h2>
                  {user.isPremium && <Crown className="h-6 w-6 text-yellow-500 shrink-0" />}
                </div>
                {user.userName && (
                  <p className="text-base text-muted-foreground wrap-break-word">@{user.userName}</p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 shrink-0">
                <Badge variant={user.isActive === "ACTIVE" ? "default" : "secondary"} className={user.isActive === "ACTIVE" ? "bg-green-500" : ""}>
                  {user.isActive}
                </Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center sm:justify-start gap-8 py-3">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{user.points}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{user.scores}</p>
                <p className="text-xs text-muted-foreground">Scores</p>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="text-center sm:text-left">
                <p className="text-sm text-foreground/90 max-w-2xl wrap-break-word mx-auto sm:mx-0">{user.bio}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>
              {(user.city || user.country) && (
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="wrap-break-word">
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="h-4 w-4" />
                <span className="whitespace-nowrap">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Premium Expiry */}
            {user.isPremium && user.premiumExpiryDate && (
              <div className="flex justify-center sm:justify-start">
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Premium until {formatDate(user.premiumExpiryDate)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points</span>
              <span className="text-xl font-bold text-yellow-600">{user.points}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scores</span>
              <span className="text-xl font-bold text-green-600">{user.scores}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.gender && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gender</span>
                <span className="font-medium capitalize">{user.gender.toLowerCase()}</span>
              </div>
            )}
            {user.dateOfBirth && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Birthday</span>
                  <span className="font-medium text-sm">{formatDate(user.dateOfBirth)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                variant={user.isActive === "ACTIVE" ? "default" : "secondary"}
                className={user.isActive === "ACTIVE" ? "bg-green-500" : ""}
              >
                {user.isActive}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      {user.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Earned Badges
            </CardTitle>
            <CardDescription>Badges you&apos;ve collected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
