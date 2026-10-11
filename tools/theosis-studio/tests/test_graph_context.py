"""Synthetic fixture only. Do not import or commit real private corpus."""
import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "graph_context.py"
spec = importlib.util.spec_from_file_location("theosis_graph_context", TARGET)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class GraphContextTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "synthetic.sqlite"
        con = sqlite3.connect(self.db)
        con.execute("CREATE TABLE nodi (id TEXT, tipo TEXT, label TEXT, attrs TEXT)")
        con.execute("CREATE TABLE archi (src TEXT, rel TEXT, dst TEXT, attrs TEXT)")
        con.execute("INSERT INTO nodi VALUES ('concetto:ricordo','concetto','Ricordo di Sé','PRIVATE-FAKE-DO-NOT-SHOW')")
        con.execute("INSERT INTO nodi VALUES ('pagina:mock','pagina','Synthetic page','{}')")
        con.execute("INSERT INTO archi VALUES ('concetto:ricordo','sottende','pagina:mock','{}')")
        con.commit()
        con.close()

    def tearDown(self):
        self.tmp.cleanup()

    def test_recovers_grounded_neighbor(self):
        result = mod.search_graph(self.db, "ricordo di sé")
        self.assertEqual(result["status"], "FOUND")
        self.assertEqual(result["matches"][0]["id"], "concetto:ricordo")
        self.assertEqual(result["matches"][0]["neighbors"][0]["relation"], "sottende")
        self.assertNotIn("PRIVATE-FAKE-DO-NOT-SHOW", str(result))

    def test_absent_is_not_invented(self):
        result = mod.search_graph(self.db, "unobtainium")
        self.assertEqual(result["status"], "NO_MATCHES")
        self.assertEqual(result["matches"], [])

    def test_stopword_query(self):
        self.assertEqual(mod.search_graph(self.db, "the and")["status"], "NO_QUERY_TERMS")


if __name__ == "__main__":
    unittest.main()
