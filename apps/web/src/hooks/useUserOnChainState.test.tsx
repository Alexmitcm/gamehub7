import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccount, useReadContract } from "wagmi";
import useUserOnChainState from "./useUserOnChainState";

// Mock wagmi hooks
vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn()
}));

const mockUseAccount = useAccount as vi.MockedFunction<typeof useAccount>;
const mockUseReadContract = useReadContract as vi.MockedFunction<
  typeof useReadContract
>;

describe("useUserOnChainState", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state when wallet is not connected", () => {
    mockUseAccount.mockReturnValue({ address: undefined });
    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUserOnChainState());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return user state data when wallet is connected", async () => {
    const mockNodeData = [
      BigInt(1640995200), // startTime
      BigInt(1000000000000000000), // balance (1 USDT)
      BigInt(100), // point
      BigInt(5), // depthLeftBranch
      BigInt(3), // depthRightBranch
      BigInt(8), // depth
      mockAddress, // player
      "0x0000000000000000000000000000000000000000", // parent
      "0x1111111111111111111111111111111111111111", // leftChild
      "0x2222222222222222222222222222222222222222" // rightChild
    ];

    mockUseAccount.mockReturnValue({ address: mockAddress });
    mockUseReadContract.mockReturnValue({
      data: mockNodeData,
      error: null,
      isLoading: false,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUserOnChainState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.referralRewardBalance).toBe(
      BigInt(1000000000000000000)
    );
    expect(result.current.data?.leftNodeCount).toBe(5);
    expect(result.current.data?.rightNodeCount).toBe(3);
    expect(result.current.data?.accountAgeInDays).toBeGreaterThan(0);
    expect(result.current.data?.directReferrals.leftChild).toBe(
      "0x1111111111111111111111111111111111111111"
    );
    expect(result.current.data?.directReferrals.rightChild).toBe(
      "0x2222222222222222222222222222222222222222"
    );
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch data");

    mockUseAccount.mockReturnValue({ address: mockAddress });
    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUserOnChainState());

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
