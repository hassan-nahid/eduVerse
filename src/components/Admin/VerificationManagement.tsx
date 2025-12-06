"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import verificationService, {
  IVerification,
  VerificationStatus,
  VerificationMeta,
} from "@/services/verification.service";
import { toast } from "sonner";
import Image from "next/image";

const VerificationManagement = () => {
  const [verifications, setVerifications] = useState<IVerification[]>([]);
  const [meta, setMeta] = useState<VerificationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<IVerification | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "ALL">(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        status?: VerificationStatus;
        sortBy: string;
        sortOrder: "asc" | "desc";
      } = {
        page: meta.page,
        limit: meta.limit,
        sortBy,
        sortOrder,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await verificationService.adminGetAllVerifications(
        params
      );

      setVerifications(response.data);
      setMeta(response.meta);
    } catch (error: unknown) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to fetch verification applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.page, meta.limit, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = (newStatus: VerificationStatus | "ALL") => {
    setStatusFilter(newStatus);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (verification: IVerification) => {
    setSelectedVerification(verification);
    setIsDetailDialogOpen(true);
  };

  const handleApproveClick = (verification: IVerification) => {
    setSelectedVerification(verification);
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (verification: IVerification) => {
    setSelectedVerification(verification);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;

    setProcessingId(selectedVerification._id);
    try {
      await verificationService.updateVerificationStatus(
        selectedVerification._id,
        {
          status: VerificationStatus.APPROVED,
        }
      );

      toast.success("Verification approved successfully");
      setIsApproveDialogOpen(false);
      fetchVerifications();
    } catch (error) {
      console.error("Error approving verification:", error);
      toast.error("Failed to approve verification");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessingId(selectedVerification._id);
    try {
      await verificationService.updateVerificationStatus(
        selectedVerification._id,
        {
          status: VerificationStatus.REJECTED,
          rejectionReason: rejectionReason.trim(),
        }
      );

      toast.success("Verification rejected");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      fetchVerifications();
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error("Failed to reject verification");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageDialogOpen(true);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      [VerificationStatus.PENDING]: {
        variant: "default" as const,
        icon: Clock,
        className: "bg-yellow-500 hover:bg-yellow-600",
      },
      [VerificationStatus.APPROVED]: {
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-green-500 hover:bg-green-600",
      },
      [VerificationStatus.REJECTED]: {
        variant: "destructive" as const,
        icon: XCircle,
        className: "",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage user verification applications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVerifications}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              handleStatusChange(value as VerificationStatus | "ALL")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value={VerificationStatus.PENDING}>
                Pending
              </SelectItem>
              <SelectItem value={VerificationStatus.APPROVED}>
                Approved
              </SelectItem>
              <SelectItem value={VerificationStatus.REJECTED}>
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label>Sort by:</Label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>ID Card</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No verification applications found
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((verification) => (
                <TableRow key={verification._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={verification.userId.avatar}
                          alt={verification.userId.name}
                        />
                        <AvatarFallback>
                          {verification.userId.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {verification.userId.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{verification.userId.userName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{verification.country}</TableCell>
                  <TableCell>{verification.institutionName}</TableCell>
                  <TableCell>{getStatusBadge(verification.status)}</TableCell>
                  <TableCell>{formatDate(verification.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewImage(verification.idCardImage)}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(verification)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {verification.status === VerificationStatus.PENDING && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveClick(verification)}
                            disabled={processingId === verification._id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(verification)}
                            disabled={processingId === verification._id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1} to{" "}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
            applications
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setMeta((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={meta.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm">
              Page {meta.page} of {meta.totalPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setMeta((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={meta.page === meta.totalPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verification Application Details</DialogTitle>
            <DialogDescription>
              Complete information about this verification request
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar>
                      <AvatarImage
                        src={selectedVerification.userId.avatar}
                        alt={selectedVerification.userId.name}
                      />
                      <AvatarFallback>
                        {selectedVerification.userId.name
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedVerification.userId.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{selectedVerification.userId.userName}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="mt-1">{selectedVerification.userId.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Country</Label>
                  <p className="mt-1">{selectedVerification.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Institution Name
                  </Label>
                  <p className="mt-1">{selectedVerification.institutionName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedVerification.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applied Date</Label>
                  <p className="mt-1">
                    {formatDate(selectedVerification.createdAt)}
                  </p>
                </div>
                {selectedVerification.updatedAt !==
                  selectedVerification.createdAt && (
                  <div>
                    <Label className="text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="mt-1">
                      {formatDate(selectedVerification.updatedAt)}
                    </p>
                  </div>
                )}
                {selectedVerification.userId.country && (
                  <div>
                    <Label className="text-muted-foreground">
                      User Location
                    </Label>
                    <p className="mt-1">
                      {selectedVerification.userId.city},{" "}
                      {selectedVerification.userId.country}
                    </p>
                  </div>
                )}
              </div>

              {selectedVerification.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md">
                  <Label className="text-red-700 dark:text-red-300">
                    Rejection Reason
                  </Label>
                  <p className="mt-1 text-red-600 dark:text-red-400">
                    {selectedVerification.rejectionReason}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">
                  ID Card Image
                </Label>
                <div className="mt-2 relative h-64 w-full border rounded-md overflow-hidden">
                  <Image
                    src={selectedVerification.idCardImage}
                    alt="ID Card"
                    fill
                    className="object-contain cursor-pointer"
                    onClick={() =>
                      handleViewImage(selectedVerification.idCardImage)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this verification application?
              The user will receive a verified badge.
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="py-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={selectedVerification.userId.avatar}
                    alt={selectedVerification.userId.name}
                  />
                  <AvatarFallback>
                    {selectedVerification.userId.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedVerification.userId.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedVerification.institutionName},{" "}
                    {selectedVerification.country}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={processingId !== null}
            >
              {processingId ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification
              application.
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={selectedVerification.userId.avatar}
                    alt={selectedVerification.userId.name}
                  />
                  <AvatarFallback>
                    {selectedVerification.userId.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedVerification.userId.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedVerification.institutionName},{" "}
                    {selectedVerification.country}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explain why this verification is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingId !== null || !rejectionReason.trim()}
            >
              {processingId ? "Processing..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ID Card Image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[600px]">
            <Image
              src={selectedImage}
              alt="ID Card"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationManagement;
