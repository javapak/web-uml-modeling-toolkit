MATCH q = (p:App)-[*]->(o:Service)
WHERE p.name="RAWHIDE"
OPTIONAL MATCH dq = (o:Service)-[*]->(d:Dependency)
RETURN p, o, relationships(q), d, relationships(dq)
