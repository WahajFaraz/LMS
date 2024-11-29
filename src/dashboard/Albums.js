// AlbumsPage.js
import Navbar from "../components/albumNav";
import AlbumList from "../components/Albumlist";

function AlbumsPage() {
  return (
    <div className="md:pt-2 pt-10">
      <Navbar />
      <AlbumList />
    </div>
  );
}

export default AlbumsPage;
