import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import PlaylistSkeleton from "./PlaylistSkeleton";
import { useMusicStore } from "@/stores/MusicStore";

const LeftSidebar = () => {
  const { isLoading, albums, fetchAlbums } = useMusicStore();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  console.log({ albums }, "\n");

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Navigation Menu */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="space-y-1">
          <Link
            to="/"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-pretty hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className="size-5 mr-2" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <SignedIn>
            <Link
              to="/chat"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-start text-pretty hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className="size-5 mr-2" />
              <span className="hidden md:inline">Messages</span>
            </Link>
          </SignedIn>
        </div>
      </div>
      {/* Library Section */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-white px-2">
            <Library className="size-5 mr-2" />
            <span className="hidden md:inline">Playlists</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2">
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              albums.map((album) => (
                <Link
                  to={`/albums/${album._id}`}
                  key={album._id}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-md group cursor-pointer"
                >
                  <img
                    src={album.imageUrl}
                    alt="Playlist image"
                    className="size-12 rounded-md flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0 hidden md:block">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-sm text-zinc-400 truncate">Album - {album.artist}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;
